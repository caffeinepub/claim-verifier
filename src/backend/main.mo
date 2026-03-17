import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Char "mo:core/Char";
import Time "mo:core/Time";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";

import MixinStorage "blob-storage/Mixin";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";



actor {
  include MixinStorage();

  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  type Claim = {
    id : Nat;
    title : Text;
    description : Text;
    category : Text;
    sessionId : Text;
    authorUsername : Text;
    timestamp : Int;
    imageUrls : [Text];
    urls : [Text];
    ogThumbnailUrl : Text;
  };

  type Vote = {
    claimId : Nat;
    sessionId : Text;
    verdict : Text;
  };

  type Evidence = {
    id : Nat;
    claimId : Nat;
    sessionId : Text;
    authorUsername : Text;
    text : Text;
    timestamp : Int;
    imageUrls : [Text];
    urls : [Text];
    evidenceType : Text;
  };

  type EvidenceVote = {
    evidenceId : Nat;
    sessionId : Text;
    direction : Text;
  };

  type Report = {
    id : Nat;
    targetId : Nat;
    targetType : Text;
    sessionId : Text;
    timestamp : Int;
  };

  type Reply = {
    id : Nat;
    evidenceId : Nat;
    parentReplyId : Nat;
    text : Text;
    authorUsername : Text;
    sessionId : Text;
    timestamp : Int;
  };

  type ReplyVote = {
    replyId : Nat;
    sessionId : Text;
    direction : Text;
  };

  type ReplyLike = {
    replyId : Nat;
    sessionId : Text;
  };

  type TrustedSource = {
    id : Nat;
    domain : Text;
    sourceType : Text;
    suggestedByUsername : Text;
    timestamp : Int;
    adminOverride : Bool;
    aboutBlurb : Text;
    pinnedAdminComment : Text;
    adminOverrideNote : Text;
  };

  type SourceVote = {
    sourceId : Nat;
    sessionId : Text;
    direction : Text;
  };

  type SourceComment = {
    id : Nat;
    sourceId : Nat;
    parentCommentId : Nat;
    text : Text;
    authorUsername : Text;
    sessionId : Text;
    timestamp : Int;
  };

  type SourceCommentLike = {
    commentId : Nat;
    sessionId : Text;
  };

  // New user profile/reputation structs
  public type PrivacySettings = {
    showClaims : Bool;
    showEvidence : Bool;
    showVotes : Bool;
    showComments : Bool;
    showSources : Bool;
    showReputation : Bool;
  };

  public type UserProfile = {
    username : Text;
    bio : Text;
    avatarUrl : Text;
    joinDate : Int;
    lastActive : Int;
    usernameLastChanged : Int;
    privacySettings : PrivacySettings;
  };

  public type ReputationEvent = {
    action : Text;
    points : Int;
    timestamp : Int;
  };

  // Persistent state (maps)
  var userProfiles : Map.Map<Principal, UserProfile> = Map.empty<Principal, UserProfile>();
  var usernames : Map.Map<Text, Principal> = Map.empty<Text, Principal>();
  var reputationEvents : Map.Map<Principal, List.List<ReputationEvent>> = Map.empty<Principal, List.List<ReputationEvent>>();

  // Existing state
  var claimsArray : [Claim] = [];
  var votesArray : [Vote] = [];
  var evidencesArray : [Evidence] = [];
  var evidenceVotesArray : [EvidenceVote] = [];
  var reportsArray : [Report] = [];
  var repliesArray : [Reply] = [];
  var replyVotesArray : [ReplyVote] = [];
  var replyLikesArray : [ReplyLike] = [];
  var trustedSourcesArray : [TrustedSource] = [];
  var sourceVotesArray : [SourceVote] = [];
  var sourceCommentsArray : [SourceComment] = [];
  var sourceCommentLikesArray : [SourceCommentLike] = [];
  var claimCount : Nat = 0;
  var evidenceCount : Nat = 0;
  var reportCount : Nat = 0;
  var replyCount : Nat = 0;
  var sourceCount : Nat = 0;
  var sourceCommentCount : Nat = 0;

  let claimCooldownsList = List.empty<(Text, Int)>();
  let evidenceCooldownsList = List.empty<(Text, Int)>();
  let replyCooldownsList = List.empty<(Text, Int)>();
  let sourceCommentCooldownsList = List.empty<(Text, Int)>();

  let ADMIN_PASSWORD = "lunasimbaliamsammy123!";
  let CLAIM_COOLDOWN_NS : Int = 300_000_000_000;
  let EVIDENCE_COOLDOWN_NS : Int = 120_000_000_000;
  let REPORT_THRESHOLD : Nat = 10;
  let SIMILARITY_THRESHOLD : Float = 0.8;
  let ONE_DAY_NS : Int = 86_400_000_000_000;
  let EVIDENCE_WEIGHT_MULTIPLIER : Float = 3.0;
  // Trusted source thresholds
  let SOURCE_MIN_VOTES : Nat = 25;
  let SOURCE_MIN_UPVOTE_PCT : Nat = 60;

  // Profile/reputation query functions
  // Create or update a user profile (checks username uniqueness and previously active)
  // Authorization: User can only modify their own profile
  public shared ({ caller }) func createOrUpdateProfile(principal : Principal, username : Text, bio : Text, avatarUrl : Text, privacySettings : PrivacySettings) : async {
    #ok;
    #err : Text;
  } {
    // Authorization: Users can only update their own profile, admins can update any
    if (caller != principal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only update your own profile");
    };

    let normalizedUsername = username.trim(#char ' ');
    if (normalizedUsername.size() < 3 or normalizedUsername.size() > 32) {
      return #err("Username must be between 3 and 32 characters.");
    };

    // Check if username is taken (ignore case) and not owned by current principal
    let existingUsername = usernames.get(normalizedUsername);

    switch (existingUsername) {
      case (?_) {
        switch (userProfiles.get(principal)) {
          case (null) { return #err("Username already taken") };
          case (?_) {};
        };
      };
      case (null) {};
    };
    let now = Time.now();

    switch (userProfiles.get(principal)) {
      case (null) {
        // New user
        let profile : UserProfile = {
          username = normalizedUsername;
          bio;
          avatarUrl;
          joinDate = now;
          lastActive = now;
          usernameLastChanged = now;
          privacySettings;
        };
        updateUsernameRegistry(principal, normalizedUsername);
        userProfiles.add(principal, profile);
        #ok;
      };
      case (?existing) {
        // Existing user (check last username change)
        let timeSinceLastChange = now - existing.usernameLastChanged;
        if (timeSinceLastChange < 86_400_000_000_000) {
          return #err("Usernames can only be changed once per day");
        };
        let profile : UserProfile = {
          username = normalizedUsername;
          bio;
          avatarUrl;
          joinDate = existing.joinDate;
          lastActive = now;
          usernameLastChanged = now;
          privacySettings;
        };
        updateUsernameRegistry(principal, normalizedUsername);
        userProfiles.add(principal, profile);
        #ok;
      };
    };
  };

  func updateUsernameRegistry(principal : Principal, username : Text) {
    switch (userProfiles.get(principal)) {
      case (null) {};
      case (?existing) { usernames.remove(existing.username) };
    };
    usernames.add(username, principal);
  };

  // Authorization: User can only update their own last active time
  public shared ({ caller }) func updateLastActive(principal : Principal) : async () {
    // Authorization: Users can only update their own last active, admins can update any
    if (caller != principal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only update your own last active time");
    };

    let now = Time.now();
    switch (userProfiles.get(principal)) {
      case (null) {};
      case (?existing) {
        let updatedProfile = {
          existing with
          lastActive = now;
        };
        userProfiles.add(principal, updatedProfile);
      };
    };
  };

  // Authorization: Public read (respects privacy settings in future enhancement)
  public query ({ caller = _ }) func getProfile(principal : Principal) : async ?UserProfile {
    userProfiles.get(principal);
  };

  // Authorization: Public read (respects privacy settings in future enhancement)
  public query ({ caller = _ }) func getProfileByUsername(username : Text) : async ?UserProfile {
    let normalizedUsername = username.trim(#char ' ');
    switch (usernames.get(normalizedUsername)) {
      case (?ownerPrincipal) { userProfiles.get(ownerPrincipal) };
      case (null) { null };
    };
  };

  // Authorization: Public read
  public query ({ caller = _ }) func isUsernameAvailable(username : Text) : async Bool {
    let normalizedUsername = username.trim(#char ' ');
    switch (usernames.get(normalizedUsername)) {
      case (?_) { false };
      case (null) { true };
    };
  };

  // Authorization: Admin-only (reputation should be system-controlled)
  public shared ({ caller }) func addReputationEvent(principal : Principal, action : Text, points : Int) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add reputation events");
    };

    let now = Time.now();
    let event : ReputationEvent = { action; points; timestamp = now };
    let allEvents = reputationEvents;
    var eventsList = List.empty<ReputationEvent>();
    switch (allEvents.get(principal)) {
      case (null) {
        eventsList.add(event);
      };
      case (?existingEvents) {
        existingEvents.add(event);
        eventsList := existingEvents;
      };
    };
    allEvents.add(principal, eventsList);
    reputationEvents := allEvents;
  };

  // Authorization: Public read (respects privacy settings in future enhancement)
  public query ({ caller = _ }) func getReputationEvents(principal : Principal) : async [ReputationEvent] {
    switch (reputationEvents.get(principal)) {
      case (null) { [] };
      case (?events) {
        events.toArray();
      };
    };
  };

  func seedClaimsData() : [Claim] {
    let seeds = [
      { title = "Cats can see in the dark"; description = "Do cats have night vision?"; category = "Animals" },
      { title = "Dinosaurs are extinct"; description = "Are there any living dinosaurs?"; category = "Science" },
      { title = "Lightning never strikes the same place twice"; description = "Is this a common misconception?"; category = "Nature" },
      { title = "Goldfish have a 3-second memory"; description = "Is this true about goldfish?"; category = "Animals" },
      { title = "Humans only use 10% of their brains"; description = "Is this a fact or myth?"; category = "Science" },
    ];
    seeds.map(
      func(s) {
        {
          id = 0;
          title = s.title;
          description = s.description;
          category = s.category;
          sessionId = "";
          authorUsername = "";
          timestamp = Time.now();
          imageUrls = [];
          urls = [];
          ogThumbnailUrl = "";
        };
      }
    );
  };

  func getReportCountFor(targetId : Nat, targetType : Text) : Nat {
    var count = 0;
    for (r in reportsArray.values()) {
      if (r.targetId == targetId and r.targetType == targetType) {
        count += 1;
      };
    };
    count;
  };

  func isHidden(targetId : Nat, targetType : Text) : Bool {
    getReportCountFor(targetId, targetType) >= REPORT_THRESHOLD;
  };

  func toLower(t : Text) : Text {
    t.map(func(c : Char) : Char {
      if (c >= 'A' and c <= 'Z') { Char.fromNat32(c.toNat32() + 32) } else { c };
    });
  };

  func tokenize(t : Text) : List.List<Text> {
    let lower = toLower(t);
    let tokens = List.empty<Text>();
    var current = "";
    for (c in lower.chars()) {
      if (c.isAlphabetic() or c.isDigit()) {
        current := current # Text.fromChar(c);
      } else {
        if (current != "") { tokens.add(current); current := "" };
      };
    };
    if (current != "") { tokens.add(current) };
    tokens;
  };

  func natToFloat(n : Nat) : Float {
    var f : Float = 0.0;
    var i = 0;
    while (i < n) { f := f + 1.0; i += 1 };
    f;
  };

  func intToFloat(i : Int) : Float {
    if (i >= 0) { natToFloat(i.toNat()) } else { -natToFloat((-i).toNat()) };
  };

  func jaccardSimilarity(a : Text, b : Text) : Float {
    let tokensA = tokenize(a);
    let tokensB = tokenize(b);
    let sizeA = tokensA.size();
    let sizeB = tokensB.size();
    if (sizeA == 0 and sizeB == 0) return 1.0;
    if (sizeA == 0 or sizeB == 0) return 0.0;
    var intersectionCount = 0;
    for (t in tokensA.values()) {
      switch (tokensB.find(func(u : Text) : Bool { u == t })) {
        case (?_) { intersectionCount += 1 };
        case null {};
      };
    };
    let unionCount : Nat = sizeA + sizeB - intersectionCount;
    if (unionCount == 0) return 0.0;
    natToFloat(intersectionCount) / natToFloat(unionCount);
  };

  func getCooldown(cooldownList : List.List<(Text, Int)>, sessionId : Text) : ?Int {
    switch (cooldownList.find(func(e : (Text, Int)) : Bool { e.0 == sessionId })) {
      case (?(_, ts)) { ?ts };
      case null { null };
    };
  };

  func updateCooldown(cooldownList : List.List<(Text, Int)>, sessionId : Text, ts : Int) {
    let filtered = cooldownList.filter(func(e : (Text, Int)) : Bool { e.0 != sessionId });
    cooldownList.clear();
    for (item in filtered.values()) { cooldownList.add(item) };
    cooldownList.add((sessionId, ts));
  };

  // Extract domain from a URL (strips protocol, path, www.)
  func extractDomain(url : Text) : Text {
    // Skip protocol prefix
    let chars = url.chars();
    let buf = List.empty<Char>();
    for (c in chars) { buf.add(c) };
    let arr = buf.toArray();
    var start = 0;
    let n = arr.size();
    // Skip "https://" or "http://"
    if (n >= 8 and arr[0] == 'h' and arr[1] == 't' and arr[2] == 't' and arr[3] == 'p') {
      if (n >= 8 and arr[4] == 's' and arr[5] == ':' and arr[6] == '/' and arr[7] == '/') {
        start := 8;
      } else if (n >= 7 and arr[4] == ':' and arr[5] == '/' and arr[6] == '/') {
        start := 7;
      };
    };
    // Skip "www."
    if (n >= start + 4 and arr[start] == 'w' and arr[start+1] == 'w' and arr[start+2] == 'w' and arr[start+3] == '.') {
      start += 4;
    };
    // Read until '/' or end
    var domain = "";
    var i = start;
    while (i < n and arr[i] != '/') {
      domain := domain # Text.fromChar(arr[i]);
      i += 1;
    };
    toLower(domain);
  };

  // Get source credibility bonus multiplier for a URL (returns bonus as parts-per-1000, e.g. 50 = 5%)
  func getSourceBonus(url : Text) : Nat {
    let domain = extractDomain(url);
    for (src in trustedSourcesArray.values()) {
      if (src.domain == domain) {
        // Check if trusted: admin override OR meets vote threshold
        var upvotes : Nat = 0;
        var downvotes : Nat = 0;
        for (v in sourceVotesArray.values()) {
          if (v.sourceId == src.id) {
            switch (v.direction) {
              case ("up") { upvotes += 1 };
              case ("down") { downvotes += 1 };
              case (_) {};
            };
          };
        };
        let totalVotes = upvotes + downvotes;
        let isTrusted = src.adminOverride or (
          totalVotes >= SOURCE_MIN_VOTES and
          upvotes * 100 >= totalVotes * SOURCE_MIN_UPVOTE_PCT
        );
        if (isTrusted) {
          // Return bonus in parts-per-1000
          let bonus : Nat = switch (src.sourceType) {
            case ("peer-reviewed") { 50 }; // 5%
            case ("government") { 40 };    // 4%
            case ("major-news") { 30 };    // 3%
            case ("independent") { 20 };   // 2%
            case ("blog") { 10 };          // 1%
            case ("social") { 5 };         // 0.5%
            case (_) { 0 };
          };
          return bonus;
        };
      };
    };
    0;
  };

  // Apply source credibility bonus to an evidence net score
  // Returns adjusted score (Int, floored at original value if no trusted source)
  // Bonus only applies if netScore >= 3 (quality gate already applied before calling this)
  func applySourceBonus(netScore : Int, evidenceUrls : [Text]) : Int {
    var maxBonus : Nat = 0;
    for (url in evidenceUrls.values()) {
      let bonus = getSourceBonus(url);
      if (bonus > maxBonus) { maxBonus := bonus };
    };
    if (maxBonus == 0) return netScore;
    // Apply bonus: netScore * (1000 + maxBonus) / 1000, using integer math
    let adjusted = (netScore * (1000 + maxBonus).toInt()) / 1000;
    adjusted;
  };

  public shared ({ caller }) func createClaim(
    title : Text,
    description : Text,
    category : Text,
    sessionId : Text,
    authorUsername : Text,
    imageUrls : [Text],
    urls : [Text],
    ogThumbnailUrl : Text,
  ) : async {
    #ok;
    #err : Text;
  } {
    // Authorization: Any user including guests can create claims
    let now = Time.now();
    switch (getCooldown(claimCooldownsList, sessionId)) {
      case (?lastTs) {
        let elapsed = now - lastTs;
        if (elapsed < CLAIM_COOLDOWN_NS) {
          let remainingSecs = (CLAIM_COOLDOWN_NS - elapsed) / 1_000_000_000;
          return #err("cooldown:" # remainingSecs.toText());
        };
      };
      case null {};
    };
    let newText = title # " " # description;
    let cutoff = now - ONE_DAY_NS;
    for (claim in claimsArray.values()) {
      if (claim.timestamp >= cutoff) {
        let sim = jaccardSimilarity(newText, claim.title # " " # claim.description);
        if (sim >= SIMILARITY_THRESHOLD) {
          return #err("duplicate:Similar claim already exists");
        };
      };
    };
    updateCooldown(claimCooldownsList, sessionId, now);
    claimCount += 1;
    let claim : Claim = {
      id = claimCount;
      title;
      description;
      category;
      sessionId;
      authorUsername;
      timestamp = now;
      imageUrls;
      urls;
      ogThumbnailUrl;
    };
    let list = List.fromArray<Claim>(claimsArray);
    list.add(claim);
    claimsArray := list.toArray();
    #ok;
  };

  public query ({ caller = _ }) func getAllClaims() : async [Claim] {
    claimsArray.filter(func(c : Claim) : Bool { not isHidden(c.id, "claim") });
  };

  public query ({ caller = _ }) func getClaimById(id : Nat) : async Claim {
    switch (claimsArray.find(func(c : Claim) : Bool { c.id == id })) {
      case (null) { Runtime.trap("Claim not found") };
      case (?c) { c };
    };
  };

  public query ({ caller = _ }) func getClaimsByCategory(category : Text) : async [Claim] {
    claimsArray.filter(func(c : Claim) : Bool {
      c.category == category and not isHidden(c.id, "claim");
    });
  };

  public shared ({ caller = _ }) func generateSessionId() : async Text {
    Time.now().toText();
  };

  public shared ({ caller }) func submitVote(claimId : Nat, sessionId : Text, verdict : Text) : async () {
    // Authorization: Any user including guests can vote
    let vote : Vote = { claimId; sessionId; verdict };
    let list = List.fromArray<Vote>(votesArray);
    list.add(vote);
    votesArray := list.toArray();
  };

  public query ({ caller = _ }) func getVoteTally(claimId : Nat) : async {
    trueCount : Nat;
    falseCount : Nat;
    unverifiedCount : Nat;
  } {
    var trueCount = 0;
    var falseCount = 0;
    var unverifiedCount = 0;
    for (v in votesArray.values()) {
      if (v.claimId == claimId) {
        switch (v.verdict) {
          case ("True") { trueCount += 1 };
          case ("False") { falseCount += 1 };
          case ("Unverified") { unverifiedCount += 1 };
          case (_) {};
        };
      };
    };
    { trueCount; falseCount; unverifiedCount };
  };

  public query ({ caller = _ }) func getSessionVoteForClaim(claimId : Nat, sessionId : Text) : async ?Text {
    switch (votesArray.find(func(v : Vote) : Bool { v.claimId == claimId and v.sessionId == sessionId })) {
      case (null) { null };
      case (?v) { ?v.verdict };
    };
  };

  public shared ({ caller }) func submitEvidence(
    claimId : Nat,
    sessionId : Text,
    authorUsername : Text,
    text : Text,
    imageUrls : [Text],
    urls : [Text],
    evidenceType : Text,
  ) : async {
    #ok;
    #err : Text;
  } {
    // Authorization: Any user including guests can submit evidence
    let now = Time.now();
    switch (getCooldown(evidenceCooldownsList, sessionId)) {
      case (?lastTs) {
        let elapsed = now - lastTs;
        if (elapsed < EVIDENCE_COOLDOWN_NS) {
          let remainingSecs = (EVIDENCE_COOLDOWN_NS - elapsed) / 1_000_000_000;
          return #err("cooldown:" # remainingSecs.toText());
        };
      };
      case null {};
    };
    let claimEvidence = evidencesArray.filter(func(e : Evidence) : Bool { e.claimId == claimId });
    for (ev in claimEvidence.values()) {
      let sim = jaccardSimilarity(text, ev.text);
      if (sim >= SIMILARITY_THRESHOLD) {
        return #err("duplicate:Similar evidence already exists");
      };
    };
    updateCooldown(evidenceCooldownsList, sessionId, now);
    evidenceCount += 1;
    let evidence : Evidence = {
      id = evidenceCount;
      claimId;
      sessionId;
      authorUsername;
      text;
      timestamp = now;
      imageUrls;
      urls;
      evidenceType;
    };
    let list = List.fromArray<Evidence>(evidencesArray);
    list.add(evidence);
    evidencesArray := list.toArray();
    #ok;
  };

  public query ({ caller = _ }) func getEvidenceForClaim(claimId : Nat) : async [Evidence] {
    evidencesArray.filter(func(e : Evidence) : Bool {
      e.claimId == claimId and not isHidden(e.id, "evidence");
    });
  };

  public shared ({ caller }) func voteEvidence(evidenceId : Nat, sessionId : Text, direction : Text) : async () {
    // Authorization: Any user including guests can vote on evidence
    let idx = evidenceVotesArray.findIndex(
      func(v : EvidenceVote) : Bool { v.evidenceId == evidenceId and v.sessionId == sessionId }
    );
    switch (idx) {
      case (null) {
        let vote : EvidenceVote = { evidenceId; sessionId; direction };
        let list = List.fromArray<EvidenceVote>(evidenceVotesArray);
        list.add(vote);
        evidenceVotesArray := list.toArray();
      };
      case (?i) {
        let existing = evidenceVotesArray[i];
        if (existing.direction == direction) {
          evidenceVotesArray := evidenceVotesArray.filter(
            func(v : EvidenceVote) : Bool { not (v.evidenceId == evidenceId and v.sessionId == sessionId) }
          );
        } else {
          evidenceVotesArray := evidenceVotesArray.map(
            func(v : EvidenceVote) : EvidenceVote {
              if (v.evidenceId == evidenceId and v.sessionId == sessionId) {
                { evidenceId = v.evidenceId; sessionId = v.sessionId; direction };
              } else { v };
            }
          );
        };
      };
    };
  };

  public query ({ caller = _ }) func getEvidenceVoteTally(evidenceId : Nat) : async { netScore : Int } {
    var up : Int = 0;
    var down : Int = 0;
    for (v in evidenceVotesArray.values()) {
      if (v.evidenceId == evidenceId) {
        switch (v.direction) {
          case ("up") { up += 1 };
          case ("down") { down += 1 };
          case (_) {};
        };
      };
    };
    { netScore = up - down : Int };
  };

  public query ({ caller = _ }) func getSessionVoteForEvidence(evidenceId : Nat, sessionId : Text) : async ?Text {
    switch (evidenceVotesArray.find(func(v : EvidenceVote) : Bool { v.evidenceId == evidenceId and v.sessionId == sessionId })) {
      case (null) { null };
      case (?v) { ?v.direction };
    };
  };

  public shared ({ caller }) func reportContent(targetId : Nat, targetType : Text, sessionId : Text) : async {
    #ok;
    #err : Text;
  } {
    // Authorization: Any user including guests can report content
    switch (reportsArray.find(func(r : Report) : Bool {
      r.targetId == targetId and r.targetType == targetType and r.sessionId == sessionId
    })) {
      case (?_) { return #err("Already reported") };
      case null {};
    };
    reportCount += 1;
    let report : Report = { id = reportCount; targetId; targetType; sessionId; timestamp = Time.now() };
    let list = List.fromArray<Report>(reportsArray);
    list.add(report);
    reportsArray := list.toArray();
    #ok;
  };

  public query ({ caller = _ }) func getReportCount(targetId : Nat, targetType : Text) : async Nat {
    getReportCountFor(targetId, targetType);
  };

  public query ({ caller }) func getHiddenClaims(password : Text) : async [Claim] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view hidden claims");
    };
    claimsArray.filter(func(c : Claim) : Bool { isHidden(c.id, "claim") });
  };

  public query ({ caller }) func getHiddenEvidence(password : Text) : async [Evidence] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view hidden evidence");
    };
    evidencesArray.filter(func(e : Evidence) : Bool { isHidden(e.id, "evidence") });
  };

  public shared ({ caller }) func restoreClaim(id : Nat, password : Text) : async {
    #ok;
    #err : Text;
  } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can restore claims");
    };
    reportsArray := reportsArray.filter(func(r : Report) : Bool {
      not (r.targetId == id and r.targetType == "claim");
    });
    #ok;
  };

  public shared ({ caller }) func restoreEvidence(id : Nat, password : Text) : async {
    #ok;
    #err : Text;
  } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can restore evidence");
    };
    reportsArray := reportsArray.filter(func(r : Report) : Bool {
      not (r.targetId == id and r.targetType == "evidence");
    });
    #ok;
  };

  public shared ({ caller }) func adminDeleteClaim(id : Nat, password : Text) : async {
    #ok;
    #err : Text;
  } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete claims");
    };
    let evidenceIds = evidencesArray
      .filter(func(e : Evidence) : Bool { e.claimId == id })
      .map(func(e : Evidence) : Nat { e.id });
    claimsArray := claimsArray.filter(func(c : Claim) : Bool { c.id != id });
    votesArray := votesArray.filter(func(v : Vote) : Bool { v.claimId != id });
    evidencesArray := evidencesArray.filter(func(e : Evidence) : Bool { e.claimId != id });
    evidenceVotesArray := evidenceVotesArray.filter(func(v : EvidenceVote) : Bool {
      switch (evidenceIds.find(func(eid : Nat) : Bool { eid == v.evidenceId })) {
        case (?_) { false };
        case null { true };
      };
    });
    reportsArray := reportsArray.filter(func(r : Report) : Bool {
      not (r.targetId == id and r.targetType == "claim");
    });
    #ok;
  };

  public shared ({ caller }) func adminDeleteEvidence(id : Nat, password : Text) : async {
    #ok;
    #err : Text;
  } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete evidence");
    };
    evidencesArray := evidencesArray.filter(func(e : Evidence) : Bool { e.id != id });
    evidenceVotesArray := evidenceVotesArray.filter(func(v : EvidenceVote) : Bool { v.evidenceId != id });
    reportsArray := reportsArray.filter(func(r : Report) : Bool {
      not (r.targetId == id and r.targetType == "evidence");
    });
    #ok;
  };

  public shared ({ caller }) func addReply(
    evidenceId : Nat,
    parentReplyId : Nat,
    text : Text,
    authorUsername : Text,
    sessionId : Text,
  ) : async {
    #ok;
    #err : Text;
  } {
    // Authorization: Any user including guests can add replies
    let now = Time.now();
    switch (getCooldown(replyCooldownsList, sessionId)) {
      case (?lastTs) {
        let elapsed = now - lastTs;
        if (elapsed < EVIDENCE_COOLDOWN_NS) {
          let remainingSecs = (EVIDENCE_COOLDOWN_NS - elapsed) / 1_000_000_000;
          return #err("cooldown:" # remainingSecs.toText());
        };
      };
      case null {};
    };
    let evidenceReplies = repliesArray
      .filter(func(r : Reply) : Bool { r.evidenceId == evidenceId });
    for (r in evidenceReplies.values()) {
      let sim = jaccardSimilarity(text, r.text);
      if (sim >= SIMILARITY_THRESHOLD) {
        return #err("duplicate:Similar reply already exists");
      };
    };
    updateCooldown(replyCooldownsList, sessionId, now);
    replyCount += 1;
    let reply : Reply = {
      id = replyCount;
      evidenceId;
      parentReplyId;
      text;
      authorUsername;
      sessionId;
      timestamp = now;
    };
    let list = List.fromArray<Reply>(repliesArray);
    list.add(reply);
    repliesArray := list.toArray();
    #ok;
  };

  public query ({ caller = _ }) func getReplies(evidenceId : Nat) : async [Reply] {
    repliesArray.filter(func(r : Reply) : Bool {
      r.evidenceId == evidenceId and not isHidden(r.id, "reply");
    });
  };

  public shared ({ caller }) func voteReply(replyId : Nat, sessionId : Text, direction : Text) : async () {
    // Authorization: Any user including guests can vote on replies
    let idx = replyVotesArray.findIndex(
      func(v : ReplyVote) : Bool { v.replyId == replyId and v.sessionId == sessionId }
    );
    switch (idx) {
      case (null) {
        let vote : ReplyVote = { replyId; sessionId; direction };
        let list = List.fromArray<ReplyVote>(replyVotesArray);
        list.add(vote);
        replyVotesArray := list.toArray();
      };
      case (?i) {
        let existing = replyVotesArray[i];
        if (existing.direction == direction) {
          replyVotesArray := replyVotesArray.filter(
            func(v : ReplyVote) : Bool { not (v.replyId == replyId and v.sessionId == sessionId) }
          );
        } else {
          replyVotesArray := replyVotesArray.map(
            func(v : ReplyVote) : ReplyVote {
              if (v.replyId == replyId and v.sessionId == sessionId) {
                { replyId = v.replyId; sessionId = v.sessionId; direction };
              } else { v };
            }
          );
        };
      };
    };
  };

  public query ({ caller = _ }) func getReplyVoteTally(replyId : Nat) : async { netScore : Int } {
    var up : Int = 0;
    var down : Int = 0;
    for (v in replyVotesArray.values()) {
      if (v.replyId == replyId) {
        switch (v.direction) {
          case ("up") { up += 1 };
          case ("down") { down += 1 };
          case (_) {};
        };
      };
    };
    { netScore = up - down : Int };
  };

  public query ({ caller = _ }) func getSessionVoteForReply(replyId : Nat, sessionId : Text) : async ?Text {
    switch (replyVotesArray.find(func(v : ReplyVote) : Bool { v.replyId == replyId and v.sessionId == sessionId })) {
      case (null) { null };
      case (?v) { ?v.direction };
    };
  };

  public shared ({ caller }) func reportReply(replyId : Nat, sessionId : Text) : async {
    #ok;
    #err : Text;
  } {
    // Authorization: Any user including guests can report replies
    switch (reportsArray.find(func(r : Report) : Bool {
      r.targetId == replyId and r.targetType == "reply" and r.sessionId == sessionId
    })) {
      case (?_) { return #err("Already reported") };
      case null {};
    };
    reportCount += 1;
    let report : Report = {
      id = reportCount;
      targetId = replyId;
      targetType = "reply";
      sessionId;
      timestamp = Time.now();
    };
    let list = List.fromArray<Report>(reportsArray);
    list.add(report);
    reportsArray := list.toArray();
    #ok;
  };

  public query ({ caller }) func getHiddenReplies(password : Text) : async [Reply] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view hidden replies");
    };
    repliesArray.filter(func(r : Reply) : Bool { isHidden(r.id, "reply") });
  };

  public shared ({ caller }) func restoreReply(id : Nat, password : Text) : async {
    #ok;
    #err : Text;
  } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can restore replies");
    };
    reportsArray := reportsArray.filter(func(r : Report) : Bool {
      not (r.targetId == id and r.targetType == "reply");
    });
    #ok;
  };

  public shared ({ caller }) func adminDeleteReply(id : Nat, password : Text) : async {
    #ok;
    #err : Text;
  } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete replies");
    };
    repliesArray := repliesArray.filter(func(r : Reply) : Bool { r.id != id });
    replyVotesArray := replyVotesArray.filter(func(v : ReplyVote) : Bool { v.replyId != id });
    replyLikesArray := replyLikesArray.filter(func(l : ReplyLike) : Bool { l.replyId != id });
    reportsArray := reportsArray.filter(func(r : Report) : Bool {
      not (r.targetId == id and r.targetType == "reply");
    });
    #ok;
  };

  public shared ({ caller }) func likeReply(replyId : Nat, sessionId : Text) : async () {
    // Authorization: Any user including guests can like replies
    let existing = replyLikesArray.find(func(l : ReplyLike) : Bool {
      l.replyId == replyId and l.sessionId == sessionId
    });
    switch (existing) {
      case (?_) {
        replyLikesArray := replyLikesArray.filter(func(l : ReplyLike) : Bool {
          not (l.replyId == replyId and l.sessionId == sessionId)
        });
      };
      case null {
        let like : ReplyLike = { replyId; sessionId };
        let list = List.fromArray<ReplyLike>(replyLikesArray);
        list.add(like);
        replyLikesArray := list.toArray();
      };
    };
  };

  public query ({ caller = _ }) func getReplyLikeCount(replyId : Nat) : async Nat {
    var count = 0;
    for (l in replyLikesArray.values()) {
      if (l.replyId == replyId) { count += 1 };
    };
    count;
  };

  public query ({ caller = _ }) func getSessionLikeForReply(replyId : Nat, sessionId : Text) : async Bool {
    switch (replyLikesArray.find(func(l : ReplyLike) : Bool {
      l.replyId == replyId and l.sessionId == sessionId
    })) {
      case (?_) { true };
      case null { false };
    };
  };

  public query ({ caller = _ }) func getReplyLikeCounts(evidenceId : Nat) : async [(Nat, Nat)] {
    let result = List.empty<(Nat, Nat)>();
    for (r in repliesArray.values()) {
      if (r.evidenceId == evidenceId) {
        var count = 0;
        for (l in replyLikesArray.values()) {
          if (l.replyId == r.id) { count += 1 };
        };
        result.add((r.id, count));
      };
    };
    result.toArray();
  };

  public shared ({ caller }) func suggestTrustedSource(domain : Text, sourceType : Text, sessionId : Text, username : Text) : async {
    #ok : Nat;
    #err : Text;
  } {
    // Authorization: Any user including guests can suggest sources
    let cleanDomain = toLower(domain);
    // Check for duplicate domain
    switch (trustedSourcesArray.find(func(s : TrustedSource) : Bool { s.domain == cleanDomain })) {
      case (?_) { return #err("Domain already suggested") };
      case null {};
    };
    sourceCount += 1;
    let src : TrustedSource = {
      id = sourceCount;
      domain = cleanDomain;
      sourceType;
      suggestedByUsername = username;
      timestamp = Time.now();
      adminOverride = false;
      aboutBlurb = "";
      pinnedAdminComment = "";
      adminOverrideNote = "";
    };
    let list = List.fromArray<TrustedSource>(trustedSourcesArray);
    list.add(src);
    trustedSourcesArray := list.toArray();
    #ok(sourceCount);
  };

  public query ({ caller = _ }) func getTrustedSources() : async [{
    id : Nat;
    domain : Text;
    sourceType : Text;
    suggestedByUsername : Text;
    timestamp : Int;
    adminOverride : Bool;
    upvotes : Nat;
    downvotes : Nat;
    isTrusted : Bool;
    aboutBlurb : Text;
    pinnedAdminComment : Text;
    adminOverrideNote : Text;
  }] {
    let result = List.empty<{
      id : Nat;
      domain : Text;
      sourceType : Text;
      suggestedByUsername : Text;
      timestamp : Int;
      adminOverride : Bool;
      upvotes : Nat;
      downvotes : Nat;
      isTrusted : Bool;
      aboutBlurb : Text;
      pinnedAdminComment : Text;
      adminOverrideNote : Text;
    }>();
    for (src in trustedSourcesArray.values()) {
      var upvotes : Nat = 0;
      var downvotes : Nat = 0;
      for (v in sourceVotesArray.values()) {
        if (v.sourceId == src.id) {
          switch (v.direction) {
            case ("up") { upvotes += 1 };
            case ("down") { downvotes += 1 };
            case (_) {};
          };
        };
      };
      let totalVotes = upvotes + downvotes;
      let isTrusted = src.adminOverride or (
        totalVotes >= SOURCE_MIN_VOTES and
        upvotes * 100 >= totalVotes * SOURCE_MIN_UPVOTE_PCT
      );
      result.add({
        id = src.id;
        domain = src.domain;
        sourceType = src.sourceType;
        suggestedByUsername = src.suggestedByUsername;
        timestamp = src.timestamp;
        adminOverride = src.adminOverride;
        upvotes;
        downvotes;
        isTrusted;
        aboutBlurb = src.aboutBlurb;
        pinnedAdminComment = src.pinnedAdminComment;
        adminOverrideNote = src.adminOverrideNote;
      });
    };
    result.toArray();
  };

  public shared ({ caller }) func voteOnSource(sourceId : Nat, sessionId : Text, direction : Text) : async {
    #ok;
    #err : Text;
  } {
    // Authorization: Any user including guests can vote on sources
    // Validate source exists
    switch (trustedSourcesArray.find(func(s : TrustedSource) : Bool { s.id == sourceId })) {
      case null { return #err("Source not found") };
      case (?_) {};
    };
    let idx = sourceVotesArray.findIndex(
      func(v : SourceVote) : Bool { v.sourceId == sourceId and v.sessionId == sessionId }
    );
    switch (idx) {
      case (null) {
        let vote : SourceVote = { sourceId; sessionId; direction };
        let list = List.fromArray<SourceVote>(sourceVotesArray);
        list.add(vote);
        sourceVotesArray := list.toArray();
      };
      case (?i) {
        let existing = sourceVotesArray[i];
        if (existing.direction == direction) {
          // Toggle off
          sourceVotesArray := sourceVotesArray.filter(
            func(v : SourceVote) : Bool { not (v.sourceId == sourceId and v.sessionId == sessionId) }
          );
        } else {
          sourceVotesArray := sourceVotesArray.map(
            func(v : SourceVote) : SourceVote {
              if (v.sourceId == sourceId and v.sessionId == sessionId) {
                { sourceId = v.sourceId; sessionId = v.sessionId; direction };
              } else { v };
            }
          );
        };
      };
    };
    #ok;
  };

  public query ({ caller = _ }) func getSessionVoteForSource(sourceId : Nat, sessionId : Text) : async ?Text {
    switch (sourceVotesArray.find(func(v : SourceVote) : Bool { v.sourceId == sourceId and v.sessionId == sessionId })) {
      case (null) { null };
      case (?v) { ?v.direction };
    };
  };

  public shared ({ caller }) func adminRemoveSource(sourceId : Nat, password : Text) : async {
    #ok;
    #err : Text;
  } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove sources");
    };
    trustedSourcesArray := trustedSourcesArray.filter(func(s : TrustedSource) : Bool { s.id != sourceId });
    sourceVotesArray := sourceVotesArray.filter(func(v : SourceVote) : Bool { v.sourceId != sourceId });
    #ok;
  };

  public shared ({ caller }) func adminOverrideSource(sourceId : Nat, approved : Bool, note : Text, password : Text) : async {
    #ok;
    #err : Text;
  } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can override sources");
    };
    trustedSourcesArray := trustedSourcesArray.map(func(s : TrustedSource) : TrustedSource {
      if (s.id == sourceId) {
        {
          id = s.id;
          domain = s.domain;
          sourceType = s.sourceType;
          suggestedByUsername = s.suggestedByUsername;
          timestamp = s.timestamp;
          adminOverride = approved;
          aboutBlurb = s.aboutBlurb;
          pinnedAdminComment = s.pinnedAdminComment;
          adminOverrideNote = note;
        };
      } else { s };
    });
    #ok;
  };

  public shared ({ caller }) func adminSetPinnedComment(sourceId : Nat, comment : Text, password : Text) : async {
    #ok;
    #err : Text;
  } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can set pinned comments");
    };
    trustedSourcesArray := trustedSourcesArray.map(func(s : TrustedSource) : TrustedSource {
      if (s.id == sourceId) {
        {
          id = s.id;
          domain = s.domain;
          sourceType = s.sourceType;
          suggestedByUsername = s.suggestedByUsername;
          timestamp = s.timestamp;
          adminOverride = s.adminOverride;
          aboutBlurb = s.aboutBlurb;
          pinnedAdminComment = comment;
          adminOverrideNote = s.adminOverrideNote;
        };
      } else { s };
    });
    #ok;
  };

  public shared ({ caller }) func adminFetchAboutBlurb(sourceId : Nat, password : Text) : async {
    #ok : Text;
    #err : Text;
  } {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can fetch about blurbs");
    };
    switch (trustedSourcesArray.find(func(s : TrustedSource) : Bool { s.id == sourceId })) {
      case (null) { return #err("Source not found") };
      case (?source) {
        let url = "https://en.wikipedia.org/api/rest_v1/page/summary/" # source.domain;
        let simulatedBlurb = "Simulated blurb for (url): " # url;
        trustedSourcesArray := trustedSourcesArray.map(
          func(s : TrustedSource) : TrustedSource {
            if (s.id == sourceId) {
              {
                id = s.id;
                domain = s.domain;
                sourceType = s.sourceType;
                suggestedByUsername = s.suggestedByUsername;
                timestamp = s.timestamp;
                adminOverride = s.adminOverride;
                aboutBlurb = simulatedBlurb;
                pinnedAdminComment = s.pinnedAdminComment;
                adminOverrideNote = s.adminOverrideNote;
              };
            } else { s };
          }
        );
        #ok(simulatedBlurb);
      };
    };
  };

  // Check if a URL matches a trusted source (for frontend badge display)
  public query ({ caller = _ }) func getSourceCredibilityForUrl(url : Text) : async {
    isTrusted : Bool;
    sourceType : Text;
    bonusPct : Nat; // e.g. 5 means 5%
    domain : Text;
  } {
    let domain = extractDomain(url);
    for (src in trustedSourcesArray.values()) {
      if (src.domain == domain) {
        var upvotes : Nat = 0;
        var downvotes : Nat = 0;
        for (v in sourceVotesArray.values()) {
          if (v.sourceId == src.id) {
            switch (v.direction) {
              case ("up") { upvotes += 1 };
              case ("down") { downvotes += 1 };
              case (_) {};
            };
          };
        };
        let totalVotes = upvotes + downvotes;
        let isTrusted = src.adminOverride or (
          totalVotes >= SOURCE_MIN_VOTES and
          upvotes * 100 >= totalVotes * SOURCE_MIN_UPVOTE_PCT
        );
        if (isTrusted) {
          let bonusPct : Nat = switch (src.sourceType) {
            case ("peer-reviewed") { 5 };
            case ("government") { 4 };
            case ("major-news") { 3 };
            case ("independent") { 2 };
            case ("blog") { 1 };
            case ("social") { 1 }; // display as 1 but internally 0.5
            case (_) { 0 };
          };
          return { isTrusted = true; sourceType = src.sourceType; bonusPct; domain };
        };
      };
    };
    { isTrusted = false; sourceType = ""; bonusPct = 0; domain };
  };

  // Enhanced Vote Tally with Multiplier + Source Credibility
  public query ({ caller = _ }) func getEnhancedVoteTally(claimId : Nat) : async {
    trueCount : Int;
    falseCount : Int;
    unverifiedCount : Int;
    trueDirect : Int;
    falseDirect : Int;
    unverifiedDirect : Int;
    trueFromEvidence : Int;
    falseFromEvidence : Int;
    unverifiedFromEvidence : Int;
  } {
    var trueDirect : Int = 0;
    var falseDirect : Int = 0;
    var unverifiedDirect : Int = 0;

    for (v in votesArray.values()) {
      if (v.claimId == claimId) {
        switch (v.verdict) {
          case ("True") { trueDirect += 1 };
          case ("False") { falseDirect += 1 };
          case ("Unverified") { unverifiedDirect += 1 };
          case (_) {};
        };
      };
    };

    let claimEvidence = evidencesArray.filter(func(e : Evidence) : Bool {
      e.claimId == claimId and not isHidden(e.id, "evidence")
    });

    // Sum qualifying evidence net scores per type (quality gate: net score >= 3)
    // Apply source credibility bonus if evidence URLs match trusted sources
    var trueEvidenceScore : Int = 0;
    var falseEvidenceScore : Int = 0;
    var unverifiedEvidenceScore : Int = 0;

    for (e in claimEvidence.values()) {
      var netVotes : Int = 0;
      for (v in evidenceVotesArray.values()) {
        if (v.evidenceId == e.id) {
          switch (v.direction) {
            case ("up") { netVotes += 1 };
            case ("down") { netVotes -= 1 };
            case (_) {};
          };
        };
      };
      // Quality gate: only count evidence with net score >= 3
      if (netVotes >= 3) {
        // Apply source credibility bonus
        let adjustedScore = applySourceBonus(netVotes, e.urls);
        switch (e.evidenceType) {
          case ("True") { trueEvidenceScore += adjustedScore };
          case ("False") { falseEvidenceScore += adjustedScore };
          case (_) { unverifiedEvidenceScore += adjustedScore };
        };
      };
    };

    // 1:1 additive model: tally = directVotes + evidenceNetScore (negative floored at 0)
    let trueTotal : Int = trueDirect + Int.max(0, trueEvidenceScore);
    let falseTotal : Int = falseDirect + Int.max(0, falseEvidenceScore);
    let unverifiedTotal : Int = unverifiedDirect + Int.max(0, unverifiedEvidenceScore);

    {
      trueCount = trueTotal;
      falseCount = falseTotal;
      unverifiedCount = unverifiedTotal;
      trueDirect;
      falseDirect;
      unverifiedDirect;
      trueFromEvidence = trueTotal - trueDirect;
      falseFromEvidence = falseTotal - falseDirect;
      unverifiedFromEvidence = unverifiedTotal - unverifiedDirect;
    };
  };

  // Added comments features
  public shared ({ caller }) func addSourceComment(sourceId : Nat, parentCommentId : Nat, text : Text, authorUsername : Text, sessionId : Text) : async {
    #ok;
    #err : Text;
  } {
    // Authorization: Any user including guests can add source comments
    let now = Time.now();
    switch (getCooldown(sourceCommentCooldownsList, sessionId)) {
      case (?lastTs) {
        let elapsed = now - lastTs;
        if (elapsed < EVIDENCE_COOLDOWN_NS) {
          let remainingSecs = (EVIDENCE_COOLDOWN_NS - elapsed) / 1_000_000_000;
          return #err("cooldown:" # remainingSecs.toText());
        };
      };
      case null {};
    };
    let sourceComments = sourceCommentsArray.filter(func(c : SourceComment) : Bool { c.sourceId == sourceId });
    for (existingComment in sourceComments.values()) {
      let sim = jaccardSimilarity(text, existingComment.text);
      if (sim >= SIMILARITY_THRESHOLD) {
        return #err("duplicate:Similar comment already exists");
      };
    };
    updateCooldown(sourceCommentCooldownsList, sessionId, now);
    sourceCommentCount += 1;
    let comment : SourceComment = {
      id = sourceCommentCount;
      sourceId;
      parentCommentId;
      text;
      authorUsername;
      sessionId;
      timestamp = now;
    };
    let list = List.fromArray<SourceComment>(sourceCommentsArray);
    list.add(comment);
    sourceCommentsArray := list.toArray();
    #ok;
  };

  public query ({ caller = _ }) func getSourceComments(sourceId : Nat) : async [SourceComment] {
    sourceCommentsArray.filter(func(c : SourceComment) : Bool {
      c.sourceId == sourceId and not isHidden(c.id, "sourceComment");
    });
  };

  public shared ({ caller }) func likeSourceComment(commentId : Nat, sessionId : Text) : async () {
    // Authorization: Any user including guests can like source comments
    let existing = sourceCommentLikesArray.find(func(l : SourceCommentLike) : Bool {
      l.commentId == commentId and l.sessionId == sessionId
    });
    switch (existing) {
      case (?_) {
        sourceCommentLikesArray := sourceCommentLikesArray.filter(func(l : SourceCommentLike) : Bool {
          not (l.commentId == commentId and l.sessionId == sessionId)
        });
      };
      case null {
        let like : SourceCommentLike = { commentId; sessionId };
        let list = List.fromArray<SourceCommentLike>(sourceCommentLikesArray);
        list.add(like);
        sourceCommentLikesArray := list.toArray();
      };
    };
  };

  public query ({ caller = _ }) func getSessionLikeForSourceComment(commentId : Nat, sessionId : Text) : async Bool {
    switch (sourceCommentLikesArray.find(func(l : SourceCommentLike) : Bool {
      l.commentId == commentId and l.sessionId == sessionId
    })) {
      case (?_) { true };
      case null { false };
    };
  };

  public query ({ caller = _ }) func getSourceCommentLikeCounts(sourceId : Nat) : async [(Nat, Nat)] {
    let result = List.empty<(Nat, Nat)>();
    for (c in sourceCommentsArray.values()) {
      if (c.sourceId == sourceId) {
        var count = 0;
        for (l in sourceCommentLikesArray.values()) {
          if (l.commentId == c.id) { count += 1 };
        };
        result.add((c.id, count));
      };
    };
    result.toArray();
  };

  public shared ({ caller }) func reportSourceComment(commentId : Nat, sessionId : Text) : async {
    #ok;
    #err : Text;
  } {
    // Authorization: Any user including guests can report source comments
    switch (reportsArray.find(func(r : Report) : Bool {
      r.targetId == commentId and r.targetType == "sourceComment" and r.sessionId == sessionId
    })) {
      case (?_) { return #err("Already reported") };
      case null {};
    };
    reportCount += 1;
    let report : Report = {
      id = reportCount;
      targetId = commentId;
      targetType = "sourceComment";
      sessionId;
      timestamp = Time.now();
    };
    let list = List.fromArray<Report>(reportsArray);
    list.add(report);
    reportsArray := list.toArray();
    #ok;
  };

  // Required profile functions for frontend
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Get activity stats for a user by username (for profile card popover)
  public query ({ caller = _ }) func getStatsByUsername(username : Text) : async {
    claimCount : Nat;
    evidenceCount : Nat;
    commentCount : Nat;
    replyCount : Nat;
    activityPoints : Int;
    trustScore : Nat;
  } {
    let normalizedUsername = username.trim(#char ' ');
    let principalOpt = usernames.get(normalizedUsername);
    
    // Count claims by this username
    let claims = claimsArray.filter(func(c : Claim) : Bool { c.authorUsername == normalizedUsername and not isHidden(c.id, "claim") });
    let claimCount = claims.size();
    
    // Count evidence by this username
    let evidence = evidencesArray.filter(func(e : Evidence) : Bool { e.authorUsername == normalizedUsername and not isHidden(e.id, "evidence") });
    let evidenceCount = evidence.size();
    
    // Count replies by this username
    let replies = repliesArray.filter(func(r : Reply) : Bool { r.authorUsername == normalizedUsername });
    let replyCount = replies.size();
    
    // Count source comments by this username
    let sourceComments = sourceCommentsArray.filter(func(c : SourceComment) : Bool { c.authorUsername == normalizedUsername });
    let commentCount = replyCount + sourceComments.size();
    
    // Calculate activity points from reputation events
    var activityPoints : Int = 0;
    switch (principalOpt) {
      case (?principal) {
        switch (reputationEvents.get(principal)) {
          case (?events) {
            for (event in events.values()) {
              activityPoints += event.points;
            };
          };
          case (null) {};
        };
      };
      case (null) {};
    };
    
    // Calculate trust score: percentage of evidence that was upvoted (net positive)
    var positiveEvidence : Nat = 0;
    if (evidenceCount > 0) {
      for (e in evidence.values()) {
        var netScore : Int = 0;
        for (vote in evidenceVotesArray.values()) {
          if (vote.evidenceId == e.id) {
            if (vote.direction == "up") { netScore += 1 } else { netScore -= 1 };
          };
        };
        if (netScore > 0) { positiveEvidence += 1 };
      };
      let trustScore = (positiveEvidence * 100) / evidenceCount;
      return { claimCount; evidenceCount; commentCount; replyCount; activityPoints; trustScore };
    };
    
    { claimCount; evidenceCount; commentCount; replyCount; activityPoints; trustScore = 0 };
  };
};
