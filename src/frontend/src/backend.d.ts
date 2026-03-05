import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Claim {
    id: bigint;
    title: string;
    imageUrls: Array<string>;
    urls: Array<string>;
    description: string;
    timestamp: bigint;
    category: string;
    sessionId: string;
}
export interface Evidence {
    id: bigint;
    imageUrls: Array<string>;
    text: string;
    urls: Array<string>;
    claimId: bigint;
    timestamp: bigint;
    sessionId: string;
}
export interface backendInterface {
    createClaim(title: string, description: string, category: string, sessionId: string, imageUrls: Array<string>, urls: Array<string>): Promise<void>;
    generateSessionId(): Promise<string>;
    getAllClaims(): Promise<Array<Claim>>;
    getClaimById(id: bigint): Promise<Claim>;
    getClaimsByCategory(category: string): Promise<Array<Claim>>;
    getEvidenceForClaim(claimId: bigint): Promise<Array<Evidence>>;
    getEvidenceVoteTally(evidenceId: bigint): Promise<{
        netScore: bigint;
    }>;
    getSessionVoteForClaim(claimId: bigint, sessionId: string): Promise<string | null>;
    getSessionVoteForEvidence(evidenceId: bigint, sessionId: string): Promise<string | null>;
    getVoteTally(claimId: bigint): Promise<{
        trueCount: bigint;
        falseCount: bigint;
        unverifiedCount: bigint;
    }>;
    submitEvidence(claimId: bigint, sessionId: string, text: string, imageUrls: Array<string>, urls: Array<string>): Promise<void>;
    submitVote(claimId: bigint, sessionId: string, verdict: string): Promise<void>;
    voteEvidence(evidenceId: bigint, sessionId: string, direction: string): Promise<void>;
}
