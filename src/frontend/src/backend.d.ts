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
    evidenceType: string;
}
export interface Reply {
    id: bigint;
    authorUsername: string;
    text: string;
    timestamp: bigint;
    parentReplyId: bigint;
    sessionId: string;
    evidenceId: bigint;
}
export interface backendInterface {
    addReply(evidenceId: bigint, parentReplyId: bigint, text: string, authorUsername: string, sessionId: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminDeleteClaim(id: bigint, password: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminDeleteEvidence(id: bigint, password: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminDeleteReply(id: bigint, password: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createClaim(title: string, description: string, category: string, sessionId: string, imageUrls: Array<string>, urls: Array<string>): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    generateSessionId(): Promise<string>;
    getAllClaims(): Promise<Array<Claim>>;
    getClaimById(id: bigint): Promise<Claim>;
    getClaimsByCategory(category: string): Promise<Array<Claim>>;
    getEnhancedVoteTally(claimId: bigint): Promise<{
        trueFromEvidence: bigint;
        unverifiedFromEvidence: bigint;
        falseDirect: bigint;
        trueCount: bigint;
        unverifiedDirect: bigint;
        falseFromEvidence: bigint;
        trueDirect: bigint;
        falseCount: bigint;
        unverifiedCount: bigint;
    }>;
    getEvidenceForClaim(claimId: bigint): Promise<Array<Evidence>>;
    getEvidenceVoteTally(evidenceId: bigint): Promise<{
        netScore: bigint;
    }>;
    getHiddenClaims(password: string): Promise<Array<Claim>>;
    getHiddenEvidence(password: string): Promise<Array<Evidence>>;
    getHiddenReplies(password: string): Promise<Array<Reply>>;
    getReplies(evidenceId: bigint): Promise<Array<Reply>>;
    getReplyVoteTally(replyId: bigint): Promise<{
        netScore: bigint;
    }>;
    getReportCount(targetId: bigint, targetType: string): Promise<bigint>;
    getSessionVoteForClaim(claimId: bigint, sessionId: string): Promise<string | null>;
    getSessionVoteForEvidence(evidenceId: bigint, sessionId: string): Promise<string | null>;
    getSessionVoteForReply(replyId: bigint, sessionId: string): Promise<string | null>;
    getVoteTally(claimId: bigint): Promise<{
        trueCount: bigint;
        falseCount: bigint;
        unverifiedCount: bigint;
    }>;
    reportContent(targetId: bigint, targetType: string, sessionId: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    reportReply(replyId: bigint, sessionId: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    restoreClaim(id: bigint, password: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    restoreEvidence(id: bigint, password: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    restoreReply(id: bigint, password: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    submitEvidence(claimId: bigint, sessionId: string, text: string, imageUrls: Array<string>, urls: Array<string>, evidenceType: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    submitVote(claimId: bigint, sessionId: string, verdict: string): Promise<void>;
    voteEvidence(evidenceId: bigint, sessionId: string, direction: string): Promise<void>;
    voteReply(replyId: bigint, sessionId: string, direction: string): Promise<void>;
}
