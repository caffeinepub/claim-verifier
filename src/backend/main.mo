import List "mo:core/List";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
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

  module Claim {
    public func compareByCategory(a : Claim, b : Claim) : Order.Order {
      Text.compare(a.category, b.category);
    };
  };

  type Vote = {
    claimId : Nat;
    sessionId : Text;
    verdict : Text;
  };

  module Vote {
    public func compareByClaimId(a : Vote, b : Vote) : Order.Order {
      Nat.compare(a.claimId, b.claimId);
    };
  };

  type Evidence = {
    id : Nat;
    claimId : Nat;
    sessionId : Text;
    text : Text;
    timestamp : Int;
    imageUrls : [Text];
    urls : [Text];
  };

  module Evidence {
    public func compareByClaimId(a : Evidence, b : Evidence) : Order.Order {
      Nat.compare(a.claimId, b.claimId);
    };
  };

  var claimsArray : [Claim] = [];
  var votesArray : [Vote] = [];
  var evidencesArray : [Evidence] = [];
  var claimCount : Nat = 0;
  var evidenceCount : Nat = 0;

  system func preupgrade() {};

  func seedClaims() : [Claim] {
    let seedClaims = [
      {
        title = "Cats can see in the dark";
        description = "Do cats have night vision?";
        category = "Animals";
      },
      {
        title = "Dinosaurs are extinct";
        description = "Are there any living dinosaurs?";
        category = "Science";
      },
      {
        title = "Lightning never strikes the same place twice";
        description = "Is this a common misconception?";
        category = "Nature";
      },
      {
        title = "Goldfish have a 3-second memory";
        description = "Is this true about goldfish?";
        category = "Animals";
      },
      {
        title = "Humans only use 10% of their brains";
        description = "Is this a fact or myth?";
        category = "Science";
      },
    ];

    seedClaims.map<{
      title : Text;
      description : Text;
      category : Text;
    }, Claim>(
      func(seedClaim) {
        {
          id = 0; // Will be assigned properly later
          title = seedClaim.title;
          description = seedClaim.description;
          category = seedClaim.category;
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
      claimsArray := seedClaims();
      claimCount := 5;
    };
  };

  public shared ({ caller }) func createClaim(title : Text, description : Text, category : Text, sessionId : Text, imageUrls : [Text], urls : [Text]) : async () {
    claimCount += 1;
    let claim : Claim = {
      id = claimCount;
      title;
      description;
      category;
      sessionId;
      timestamp = Time.now();
      imageUrls;
      urls;
    };
    let claimsList = List.fromArray<Claim>(claimsArray);
    claimsList.add(claim);
    claimsArray := claimsList.toArray();
  };

  public query ({ caller }) func getAllClaims() : async [Claim] {
    claimsArray;
  };

  public query ({ caller }) func getClaimById(id : Nat) : async Claim {
    switch (claimsArray.find(func(claim) { claim.id == id })) {
      case (null) { Runtime.trap("Claim not found") };
      case (?claim) { claim };
    };
  };

  public query ({ caller }) func getClaimsByCategory(category : Text) : async [Claim] {
    claimsArray.filter(
      func(claim) { claim.category == category }
    );
  };

  public shared ({ caller }) func generateSessionId() : async Text {
    Time.now().toText();
  };

  public shared ({ caller }) func submitVote(claimId : Nat, sessionId : Text, verdict : Text) : async () {
    let vote : Vote = {
      claimId;
      sessionId;
      verdict;
    };
    let votesList = List.fromArray<Vote>(votesArray);
    votesList.add(vote);
    votesArray := votesList.toArray();
  };

  public query ({ caller }) func getVoteTally(claimId : Nat) : async {
    trueCount : Nat;
    falseCount : Nat;
    unverifiedCount : Nat;
  } {
    var trueCount = 0;
    var falseCount = 0;
    var unverifiedCount = 0;

    for (vote in votesArray.values()) {
      if (vote.claimId == claimId) {
        switch (vote.verdict) {
          case ("True") { trueCount += 1 };
          case ("False") { falseCount += 1 };
          case ("Unverified") { unverifiedCount += 1 };
          case (_) {};
        };
      };
    };

    {
      trueCount;
      falseCount;
      unverifiedCount;
    };
  };

  public query ({ caller }) func getSessionVoteForClaim(claimId : Nat, sessionId : Text) : async ?Text {
    switch (votesArray.find(func(vote) { (vote.claimId == claimId and vote.sessionId == sessionId) })) {
      case (null) { null };
      case (?vote) { ?vote.verdict };
    };
  };

  public shared ({ caller }) func submitEvidence(claimId : Nat, sessionId : Text, text : Text, imageUrls : [Text], urls : [Text]) : async () {
    evidenceCount += 1;
    let evidence : Evidence = {
      id = evidenceCount;
      claimId;
      sessionId;
      text;
      timestamp = Time.now();
      imageUrls;
      urls;
    };
    let evidencesList = List.fromArray<Evidence>(evidencesArray);
    evidencesList.add(evidence);
    evidencesArray := evidencesList.toArray();
  };

  public query ({ caller }) func getEvidenceForClaim(claimId : Nat) : async [Evidence] {
    evidencesArray.filter(func(evidence) { evidence.claimId == claimId });
  };
};
