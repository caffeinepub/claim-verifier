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
    ogThumbnailUrl: string;
    timestamp: bigint;
    category: string;
    sessionId: string;
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
export interface SourceComment {
    id: bigint;
    authorUsername: string;
    parentCommentId: bigint;
    text: string;
    sourceId: bigint;
    timestamp: bigint;
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
export interface backendInterface {
    addReply(evidenceId: bigint, parentReplyId: bigint, text: string, authorUsername: string, sessionId: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    addSourceComment(sourceId: bigint, parentCommentId: bigint, text: string, authorUsername: string, sessionId: string): Promise<{
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
    adminFetchAboutBlurb(sourceId: bigint, password: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminOverrideSource(sourceId: bigint, approved: boolean, note: string, password: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminRemoveSource(sourceId: bigint, password: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    adminSetPinnedComment(sourceId: bigint, comment: string, password: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    createClaim(title: string, description: string, category: string, sessionId: string, imageUrls: Array<string>, urls: Array<string>, ogThumbnailUrl: string): Promise<{
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
    getReplyLikeCount(replyId: bigint): Promise<bigint>;
    getReplyLikeCounts(evidenceId: bigint): Promise<Array<[bigint, bigint]>>;
    getReplyVoteTally(replyId: bigint): Promise<{
        netScore: bigint;
    }>;
    getReportCount(targetId: bigint, targetType: string): Promise<bigint>;
    getSessionLikeForReply(replyId: bigint, sessionId: string): Promise<boolean>;
    getSessionLikeForSourceComment(commentId: bigint, sessionId: string): Promise<boolean>;
    getSessionVoteForClaim(claimId: bigint, sessionId: string): Promise<string | null>;
    getSessionVoteForEvidence(evidenceId: bigint, sessionId: string): Promise<string | null>;
    getSessionVoteForReply(replyId: bigint, sessionId: string): Promise<string | null>;
    getSessionVoteForSource(sourceId: bigint, sessionId: string): Promise<string | null>;
    getSourceCommentLikeCounts(sourceId: bigint): Promise<Array<[bigint, bigint]>>;
    getSourceComments(sourceId: bigint): Promise<Array<SourceComment>>;
    getSourceCredibilityForUrl(url: string): Promise<{
        isTrusted: boolean;
        domain: string;
        sourceType: string;
        bonusPct: bigint;
    }>;
    getTrustedSources(): Promise<Array<{
        id: bigint;
        upvotes: bigint;
        adminOverrideNote: string;
        aboutBlurb: string;
        isTrusted: boolean;
        domain: string;
        sourceType: string;
        adminOverride: boolean;
        timestamp: bigint;
        pinnedAdminComment: string;
        downvotes: bigint;
        suggestedByUsername: string;
    }>>;
    getVoteTally(claimId: bigint): Promise<{
        trueCount: bigint;
        falseCount: bigint;
        unverifiedCount: bigint;
    }>;
    likeReply(replyId: bigint, sessionId: string): Promise<void>;
    likeSourceComment(commentId: bigint, sessionId: string): Promise<void>;
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
    reportSourceComment(commentId: bigint, sessionId: string): Promise<{
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
    suggestTrustedSource(domain: string, sourceType: string, sessionId: string, username: string): Promise<{
        __kind__: "ok";
        ok: bigint;
    } | {
        __kind__: "err";
        err: string;
    }>;
    voteEvidence(evidenceId: bigint, sessionId: string, direction: string): Promise<void>;
    voteOnSource(sourceId: bigint, sessionId: string, direction: string): Promise<{
        __kind__: "ok";
        ok: null;
    } | {
        __kind__: "err";
        err: string;
    }>;
    voteReply(replyId: bigint, sessionId: string, direction: string): Promise<void>;
}
