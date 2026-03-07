import List "mo:core/List";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Char "mo:core/Char";
import Float "mo:core/Float";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  type Claim = {
    id : Nat;
    title : Text;
    description : Text;
    category : Text;
    sessionId : Text;
    timestamp : Int;
    imageUrls : [Text];
    urls : [Text];
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
    text : Text;
    timestamp : Int;
    imageUrls : [Text];
    urls : [Text];
    evidenceType : Text; // Added evidenceType field
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

  var claimsArray : [Claim] = [];
  var votesArray : [Vote] = [];
  var evidencesArray : [Evidence] = [];
  var evidenceVotesArray : [EvidenceVote] = [];
  var reportsArray : [Report] = [];
  var repliesArray : [Reply] = [];
  var replyVotesArray : [ReplyVote] = [];
  var claimCount : Nat = 0;
  var evidenceCount : Nat = 0;
  var reportCount : Nat = 0;
  var replyCount : Nat = 0;

  let claimCooldownsList = List.empty<(Text, Int)>();
  let evidenceCooldownsList = List.empty<(Text, Int)>();
  let replyCooldownsList = List.empty<(Text, Int)>();

  let ADMIN_PASSWORD = "lunasimbaliamsammy123!";
  let CLAIM_COOLDOWN_NS : Int = 300_000_000_000;
  let EVIDENCE_COOLDOWN_NS : Int = 120_000_000_000;
  let REPORT_THRESHOLD : Nat = 10;
  let SIMILARITY_THRESHOLD : Float = 0.8;
  let ONE_DAY_NS : Int = 86_400_000_000_000;
  let EVIDENCE_WEIGHT_MULTIPLIER = 3.0;

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
          timestamp = Time.now();
          imageUrls = [];
          urls = [];
        };
      }
    );
  };

  system func postupgrade() {
    if (claimCount == 0) {
      claimsArray := [];
      claimsArray := seedClaimsData();
      claimCount := 5;
    };
  };

  func getReportCountFor(targetId : Nat, targetType : Text) : Nat {
    var count = 0;
    for (r in reportsArray.values()) {
      if (r.targetId == targetId and r.targetType == targetType) { count += 1 };
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

  public shared func createClaim(
    title : Text,
    description : Text,
    category : Text,
    sessionId : Text,
    imageUrls : [Text],
    urls : [Text],
  ) : async {
    #ok;
    #err : Text;
  } {
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
      timestamp = now;
      imageUrls;
      urls;
    };
    let list = List.fromArray<Claim>(claimsArray);
    list.add(claim);
    claimsArray := list.toArray();
    #ok;
  };

  public query func getAllClaims() : async [Claim] {
    claimsArray.filter(func(c : Claim) : Bool { not isHidden(c.id, "claim") });
  };

  public query func getClaimById(id : Nat) : async Claim {
    switch (claimsArray.find(func(c : Claim) : Bool { c.id == id })) {
      case (null) { Runtime.trap("Claim not found") };
      case (?c) { c };
    };
  };

  public query func getClaimsByCategory(category : Text) : async [Claim] {
    claimsArray.filter(func(c : Claim) : Bool {
      c.category == category and not isHidden(c.id, "claim");
    });
  };

  public shared func generateSessionId() : async Text {
    Time.now().toText();
  };

  public shared func submitVote(claimId : Nat, sessionId : Text, verdict : Text) : async () {
    let vote : Vote = { claimId; sessionId; verdict };
    let list = List.fromArray<Vote>(votesArray);
    list.add(vote);
    votesArray := list.toArray();
  };

  public query func getVoteTally(claimId : Nat) : async {
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

  public query func getSessionVoteForClaim(claimId : Nat, sessionId : Text) : async ?Text {
    switch (votesArray.find(func(v : Vote) : Bool { v.claimId == claimId and v.sessionId == sessionId })) {
      case (null) { null };
      case (?v) { ?v.verdict };
    };
  };

  // Updated submitEvidence to include evidenceType parameter
  public shared func submitEvidence(
    claimId : Nat,
    sessionId : Text,
    text : Text,
    imageUrls : [Text],
    urls : [Text],
    evidenceType : Text, // New parameter
  ) : async {
    #ok;
    #err : Text;
  } {
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
      text;
      timestamp = now;
      imageUrls;
      urls;
      evidenceType; // Set evidenceType field
    };
    let list = List.fromArray<Evidence>(evidencesArray);
    list.add(evidence);
    evidencesArray := list.toArray();
    #ok;
  };

  public query func getEvidenceForClaim(claimId : Nat) : async [Evidence] {
    evidencesArray.filter(func(e : Evidence) : Bool {
      e.claimId == claimId and not isHidden(e.id, "evidence");
    });
  };

  public shared func voteEvidence(evidenceId : Nat, sessionId : Text, direction : Text) : async () {
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

  public query func getEvidenceVoteTally(evidenceId : Nat) : async { netScore : Int } {
    var up = 0;
    var down = 0;
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

  public query func getSessionVoteForEvidence(evidenceId : Nat, sessionId : Text) : async ?Text {
    switch (evidenceVotesArray.find(func(v : EvidenceVote) : Bool { v.evidenceId == evidenceId and v.sessionId == sessionId })) {
      case (null) { null };
      case (?v) { ?v.direction };
    };
  };

  public shared func reportContent(targetId : Nat, targetType : Text, sessionId : Text) : async {
    #ok;
    #err : Text;
  } {
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

  public query func getReportCount(targetId : Nat, targetType : Text) : async Nat {
    getReportCountFor(targetId, targetType);
  };

  public query func getHiddenClaims(password : Text) : async [Claim] {
    if (password != ADMIN_PASSWORD) { Runtime.trap("Unauthorized") };
    claimsArray.filter(func(c : Claim) : Bool { isHidden(c.id, "claim") });
  };

  public query func getHiddenEvidence(password : Text) : async [Evidence] {
    if (password != ADMIN_PASSWORD) { Runtime.trap("Unauthorized") };
    evidencesArray.filter(func(e : Evidence) : Bool { isHidden(e.id, "evidence") });
  };

  public shared func restoreClaim(id : Nat, password : Text) : async {
    #ok;
    #err : Text;
  } {
    if (password != ADMIN_PASSWORD) { return #err("Unauthorized") };
    reportsArray := reportsArray.filter(func(r : Report) : Bool {
      not (r.targetId == id and r.targetType == "claim");
    });
    #ok;
  };

  public shared func restoreEvidence(id : Nat, password : Text) : async {
    #ok;
    #err : Text;
  } {
    if (password != ADMIN_PASSWORD) { return #err("Unauthorized") };
    reportsArray := reportsArray.filter(func(r : Report) : Bool {
      not (r.targetId == id and r.targetType == "evidence");
    });
    #ok;
  };

  public shared func adminDeleteClaim(id : Nat, password : Text) : async {
    #ok;
    #err : Text;
  } {
    if (password != ADMIN_PASSWORD) { return #err("Unauthorized") };
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

  public shared func adminDeleteEvidence(id : Nat, password : Text) : async {
    #ok;
    #err : Text;
  } {
    if (password != ADMIN_PASSWORD) { return #err("Unauthorized") };
    evidencesArray := evidencesArray.filter(func(e : Evidence) : Bool { e.id != id });
    evidenceVotesArray := evidenceVotesArray.filter(func(v : EvidenceVote) : Bool { v.evidenceId != id });
    reportsArray := reportsArray.filter(func(r : Report) : Bool {
      not (r.targetId == id and r.targetType == "evidence");
    });
    #ok;
  };

  public shared func addReply(
    evidenceId : Nat,
    parentReplyId : Nat,
    text : Text,
    authorUsername : Text,
    sessionId : Text,
  ) : async {
    #ok;
    #err : Text;
  } {
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

  public query func getReplies(evidenceId : Nat) : async [Reply] {
    repliesArray.filter(func(r : Reply) : Bool {
      r.evidenceId == evidenceId and not isHidden(r.id, "reply");
    });
  };

  public shared func voteReply(replyId : Nat, sessionId : Text, direction : Text) : async () {
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

  public query func getReplyVoteTally(replyId : Nat) : async { netScore : Int } {
    var up = 0;
    var down = 0;
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

  public query func getSessionVoteForReply(replyId : Nat, sessionId : Text) : async ?Text {
    switch (replyVotesArray.find(func(v : ReplyVote) : Bool { v.replyId == replyId and v.sessionId == sessionId })) {
      case (null) { null };
      case (?v) { ?v.direction };
    };
  };

  public shared func reportReply(replyId : Nat, sessionId : Text) : async {
    #ok;
    #err : Text;
  } {
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

  public query func getHiddenReplies(password : Text) : async [Reply] {
    if (password != ADMIN_PASSWORD) { Runtime.trap("Unauthorized") };
    repliesArray.filter(func(r : Reply) : Bool { isHidden(r.id, "reply") });
  };

  public shared func restoreReply(id : Nat, password : Text) : async {
    #ok;
    #err : Text;
  } {
    if (password != ADMIN_PASSWORD) { return #err("Unauthorized") };
    reportsArray := reportsArray.filter(func(r : Report) : Bool {
      not (r.targetId == id and r.targetType == "reply");
    });
    #ok;
  };

  public shared func adminDeleteReply(id : Nat, password : Text) : async {
    #ok;
    #err : Text;
  } {
    if (password != ADMIN_PASSWORD) { return #err("Unauthorized") };
    repliesArray := repliesArray.filter(func(r : Reply) : Bool { r.id != id });
    replyVotesArray := replyVotesArray.filter(func(v : ReplyVote) : Bool { v.replyId != id });
    reportsArray := reportsArray.filter(func(r : Report) : Bool {
      not (r.targetId == id and r.targetType == "reply");
    });
    #ok;
  };

  public query func getEnhancedVoteTally(claimId : Nat) : async {
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
    var trueDirect = 0;
    var falseDirect = 0;
    var unverifiedDirect = 0;

    var trueFromEvidence : Float = 0.0;
    var falseFromEvidence : Float = 0.0;
    var unverifiedFromEvidence : Float = 0.0;

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

    let claimEvidence = evidencesArray.filter(func(e : Evidence) : Bool { e.claimId == claimId and not isHidden(e.id, "evidence") });

    for (e in claimEvidence.values()) {
      var netVotes = 0;
      for (v in evidenceVotesArray.values()) {
        if (v.evidenceId == e.id) {
          switch (v.direction) {
            case ("up") { netVotes += 1 };
            case ("down") { netVotes -= 1 };
            case (_) {};
          };
        };
      };
      let weightedScore = intToFloat(netVotes) * EVIDENCE_WEIGHT_MULTIPLIER;
      switch (e.evidenceType) {
        case ("True") { trueFromEvidence += weightedScore };
        case ("False") { falseFromEvidence += weightedScore };
        case (_) { unverifiedFromEvidence += weightedScore };
      };
    };

    {
      trueCount = trueDirect + trueFromEvidence.toInt();
      falseCount = falseDirect + falseFromEvidence.toInt();
      unverifiedCount = unverifiedDirect + unverifiedFromEvidence.toInt();
      trueDirect;
      falseDirect;
      unverifiedDirect;
      trueFromEvidence = trueFromEvidence.toInt();
      falseFromEvidence = falseFromEvidence.toInt();
      unverifiedFromEvidence = unverifiedFromEvidence.toInt();
    };
  };
};
