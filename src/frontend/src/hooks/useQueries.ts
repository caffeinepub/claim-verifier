import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Claim, Evidence, Reply } from "../backend.d";
import { useActor } from "./useActor";

// ── Session ──────────────────────────────────────────────────────────────────

const SESSION_KEY = "claim_verifier_session_id";
const USERNAME_KEY = "claim_verifier_username";

export function getOrInitSessionId(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function saveSessionId(id: string): void {
  localStorage.setItem(SESSION_KEY, id);
}

function generateUsername(): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getOrInitUsername(): string {
  const existing = localStorage.getItem(USERNAME_KEY);
  if (existing) return existing;
  const username = generateUsername();
  localStorage.setItem(USERNAME_KEY, username);
  return username;
}

export function useUsername(): string {
  // Initialize once -- no reactive updates needed since username never changes mid-session
  return getOrInitUsername();
}

export function useSessionId() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ["sessionId"],
    queryFn: async () => {
      const existing = localStorage.getItem(SESSION_KEY);
      if (existing) {
        // Ensure username is also initialized alongside session
        getOrInitUsername();
        return existing;
      }
      if (!actor) throw new Error("No actor");
      const id = await actor.generateSessionId();
      localStorage.setItem(SESSION_KEY, id);
      // Initialize username at the same time as session
      getOrInitUsername();
      return id;
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
  });
}

// ── OG Image Helper ───────────────────────────────────────────────────────────

async function fetchOgImageFromUrl(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    const html = await response.text();
    const match =
      html.match(
        /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
      ) ??
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
      );
    return match?.[1] ?? "";
  } catch {
    return "";
  }
}

// ── Claims ────────────────────────────────────────────────────────────────────

export function useAllClaims() {
  const { actor, isFetching } = useActor();
  return useQuery<Claim[]>({
    queryKey: ["claims", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllClaims();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useClaimsByCategory(category: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Claim[]>({
    queryKey: ["claims", "category", category],
    queryFn: async () => {
      if (!actor) return [];
      if (category === "All") return actor.getAllClaims();
      return actor.getClaimsByCategory(category);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useClaimById(id: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Claim>({
    queryKey: ["claim", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) throw new Error("No actor or id");
      return actor.getClaimById(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useCreateClaim() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
      category,
      sessionId,
      imageUrls = [],
      urls = [],
    }: {
      title: string;
      description: string;
      category: string;
      sessionId: string;
      imageUrls?: string[];
      urls?: string[];
    }) => {
      if (!actor) throw new Error("No actor");

      // Attempt OG image extraction from first URL if no images uploaded
      let ogThumbnailUrl = "";
      if (imageUrls.length === 0 && urls.length > 0 && urls[0]) {
        ogThumbnailUrl = await fetchOgImageFromUrl(urls[0]);
      }

      const result = await actor.createClaim(
        title,
        description,
        category,
        sessionId,
        imageUrls,
        urls,
        ogThumbnailUrl,
      );
      if (result && "err" in result) {
        throw new Error(result.err as string);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
    },
  });
}

// ── Votes ─────────────────────────────────────────────────────────────────────

export function useVoteTally(claimId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<{
    trueCount: bigint;
    falseCount: bigint;
    unverifiedCount: bigint;
  }>({
    queryKey: ["tally", claimId?.toString()],
    queryFn: async () => {
      if (!actor || claimId === null) throw new Error("No actor or id");
      return actor.getVoteTally(claimId);
    },
    enabled: !!actor && !isFetching && claimId !== null,
  });
}

export function useEnhancedVoteTally(claimId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<{
    trueFromEvidence: bigint;
    unverifiedFromEvidence: bigint;
    falseDirect: bigint;
    trueCount: bigint;
    unverifiedDirect: bigint;
    falseFromEvidence: bigint;
    trueDirect: bigint;
    falseCount: bigint;
    unverifiedCount: bigint;
  }>({
    queryKey: ["enhanced-tally", claimId?.toString()],
    queryFn: async () => {
      if (!actor || claimId === null) throw new Error("No actor or id");
      try {
        return await actor.getEnhancedVoteTally(claimId);
      } catch (err) {
        console.error(
          "[getEnhancedVoteTally] failed for claimId",
          claimId?.toString(),
          err,
        );
        throw err;
      }
    },
    enabled: !!actor && !isFetching && claimId !== null,
    retry: 1,
  });
}

export function useSessionVote(
  claimId: bigint | null,
  sessionId: string | null,
) {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ["vote", claimId?.toString(), sessionId],
    queryFn: async () => {
      if (!actor || claimId === null || !sessionId) return null;
      return actor.getSessionVoteForClaim(claimId, sessionId);
    },
    enabled: !!actor && !isFetching && claimId !== null && !!sessionId,
  });
}

export function useSubmitVote() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      claimId,
      sessionId,
      verdict,
    }: {
      claimId: bigint;
      sessionId: string;
      verdict: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.submitVote(claimId, sessionId, verdict);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["tally", variables.claimId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["enhanced-tally", variables.claimId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["vote", variables.claimId.toString()],
      });
    },
  });
}

// ── Evidence ──────────────────────────────────────────────────────────────────

export function useEvidence(claimId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Evidence[]>({
    queryKey: ["evidence", claimId?.toString()],
    queryFn: async () => {
      if (!actor || claimId === null) return [];
      return actor.getEvidenceForClaim(claimId);
    },
    enabled: !!actor && !isFetching && claimId !== null,
  });
}

export function useSubmitEvidence() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      claimId,
      sessionId,
      text,
      imageUrls = [],
      urls = [],
      evidenceType = "Unverified",
    }: {
      claimId: bigint;
      sessionId: string;
      text: string;
      imageUrls?: string[];
      urls?: string[];
      evidenceType?: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.submitEvidence(
        claimId,
        sessionId,
        text,
        imageUrls,
        urls,
        evidenceType ?? "Unverified",
      );
      if (result && "err" in result) {
        throw new Error(result.err as string);
      }
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["evidence", variables.claimId.toString()],
      });
    },
  });
}

// ── Evidence Votes ────────────────────────────────────────────────────────────

export function useEvidenceVoteTally(evidenceId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<{ netScore: bigint }>({
    queryKey: ["evidence-tally", evidenceId?.toString()],
    queryFn: async () => {
      if (!actor || evidenceId === null) throw new Error("No actor or id");
      return actor.getEvidenceVoteTally(evidenceId);
    },
    enabled: !!actor && !isFetching && evidenceId !== null,
  });
}

export function useSessionVoteForEvidence(
  evidenceId: bigint | null,
  sessionId: string | null,
) {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ["evidence-vote", evidenceId?.toString(), sessionId],
    queryFn: async () => {
      if (!actor || evidenceId === null || !sessionId) return null;
      return actor.getSessionVoteForEvidence(evidenceId, sessionId);
    },
    enabled: !!actor && !isFetching && evidenceId !== null && !!sessionId,
  });
}

export function useAllEvidenceTallies(evidenceIds: bigint[]) {
  const { actor, isFetching } = useActor();
  return useQuery<Record<string, number>>({
    queryKey: ["evidence-tallies-bulk", evidenceIds.map((id) => id.toString())],
    queryFn: async () => {
      if (!actor) return {};
      const entries = await Promise.all(
        evidenceIds.map(async (id) => {
          const tally = await actor.getEvidenceVoteTally(id);
          return [id.toString(), Number(tally.netScore)] as [string, number];
        }),
      );
      return Object.fromEntries(entries);
    },
    enabled: !!actor && !isFetching && evidenceIds.length > 0,
    staleTime: 10_000,
  });
}

export function useVoteEvidence() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      evidenceId,
      sessionId,
      direction,
      claimId: _claimId,
    }: {
      evidenceId: bigint;
      sessionId: string;
      direction: string;
      claimId?: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.voteEvidence(evidenceId, sessionId, direction);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["evidence-tally", variables.evidenceId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["evidence-vote", variables.evidenceId.toString()],
      });
      // Also refresh the enhanced claim tally since evidence votes affect it
      if (variables.claimId != null) {
        queryClient.invalidateQueries({
          queryKey: ["enhanced-tally", variables.claimId.toString()],
        });
      }
    },
  });
}

// ── Reporting ─────────────────────────────────────────────────────────────────

export function useReportContent() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      targetId,
      targetType,
      sessionId,
    }: {
      targetId: bigint;
      targetType: string;
      sessionId: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.reportContent(targetId, targetType, sessionId);
      if (result && "err" in result) {
        throw new Error(result.err as string);
      }
      return result;
    },
  });
}

// ── Replies ───────────────────────────────────────────────────────────────────

export type { Reply };

export function useReplies(evidenceId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Reply[]>({
    queryKey: ["replies", evidenceId?.toString()],
    queryFn: async () => {
      if (!actor || evidenceId === null) return [];
      return actor.getReplies(evidenceId);
    },
    enabled: !!actor && !isFetching && evidenceId !== null,
  });
}

export function useAddReply() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      evidenceId,
      parentReplyId,
      text,
      authorUsername,
      sessionId,
    }: {
      evidenceId: bigint;
      parentReplyId: bigint;
      text: string;
      authorUsername: string;
      sessionId: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.addReply(
        evidenceId,
        parentReplyId,
        text,
        authorUsername,
        sessionId,
      );
      if (result && result.__kind__ === "err") {
        throw new Error(result.err as string);
      }
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["replies", variables.evidenceId.toString()],
      });
    },
  });
}

export function useVoteReply() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      replyId,
      sessionId,
      direction,
    }: {
      replyId: bigint;
      sessionId: string;
      direction: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.voteReply(replyId, sessionId, direction);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["reply-tally", variables.replyId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["reply-vote", variables.replyId.toString()],
      });
    },
  });
}

export function useReplyVoteTally(replyId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<{ netScore: bigint }>({
    queryKey: ["reply-tally", replyId?.toString()],
    queryFn: async () => {
      if (!actor || replyId === null) throw new Error("No actor or id");
      return actor.getReplyVoteTally(replyId);
    },
    enabled: !!actor && !isFetching && replyId !== null,
  });
}

export function useSessionVoteForReply(
  replyId: bigint | null,
  sessionId: string | null,
) {
  const { actor, isFetching } = useActor();
  return useQuery<string | null>({
    queryKey: ["reply-vote", replyId?.toString(), sessionId],
    queryFn: async () => {
      if (!actor || replyId === null || !sessionId) return null;
      return actor.getSessionVoteForReply(replyId, sessionId);
    },
    enabled: !!actor && !isFetching && replyId !== null && !!sessionId,
  });
}

export function useReportReply() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      replyId,
      sessionId,
    }: {
      replyId: bigint;
      sessionId: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.reportReply(replyId, sessionId);
      if (result && result.__kind__ === "err") {
        throw new Error(result.err as string);
      }
      return result;
    },
  });
}

export function useGetHiddenReplies(password: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Reply[]>({
    queryKey: ["admin", "hidden-replies", password],
    queryFn: async () => {
      if (!actor || !password) return [];
      return actor.getHiddenReplies(password);
    },
    enabled: !!actor && !isFetching && !!password,
    retry: false,
  });
}

export function useRestoreReply() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      password,
    }: {
      id: bigint;
      password: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.restoreReply(id, password);
      if (result && result.__kind__ === "err") {
        throw new Error(result.err as string);
      }
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["replies"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "hidden-replies", variables.password],
      });
    },
  });
}

export function useAdminDeleteReply() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      password,
    }: {
      id: bigint;
      password: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await actor.adminDeleteReply(id, password);
      if (result && result.__kind__ === "err") {
        throw new Error(result.err as string);
      }
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["replies"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "hidden-replies", variables.password],
      });
    },
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export function useGetHiddenClaims(password: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Claim[]>({
    queryKey: ["admin", "hidden-claims", password],
    queryFn: async () => {
      if (!actor || !password) return [];
      return (actor as any).getHiddenClaims(password);
    },
    enabled: !!actor && !isFetching && !!password,
    retry: false,
  });
}

export function useGetHiddenEvidence(password: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Evidence[]>({
    queryKey: ["admin", "hidden-evidence", password],
    queryFn: async () => {
      if (!actor || !password) return [];
      return (actor as any).getHiddenEvidence(password);
    },
    enabled: !!actor && !isFetching && !!password,
    retry: false,
  });
}

export function useRestoreClaim() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      password,
    }: {
      id: bigint;
      password: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor as any).restoreClaim(id, password);
      if (result && "err" in result) {
        throw new Error(result.err as string);
      }
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "hidden-claims", variables.password],
      });
    },
  });
}

export function useRestoreEvidence() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      password,
    }: {
      id: bigint;
      password: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor as any).restoreEvidence(id, password);
      if (result && "err" in result) {
        throw new Error(result.err as string);
      }
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "hidden-evidence", variables.password],
      });
    },
  });
}

export function useAdminDeleteClaim() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      password,
    }: {
      id: bigint;
      password: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor as any).adminDeleteClaim(id, password);
      if (result && "err" in result) {
        throw new Error(result.err as string);
      }
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["claims"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "hidden-claims", variables.password],
      });
    },
  });
}

export function useAdminDeleteEvidence() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      password,
    }: {
      id: bigint;
      password: string;
    }) => {
      if (!actor) throw new Error("No actor");
      const result = await (actor as any).adminDeleteEvidence(id, password);
      if (result && "err" in result) {
        throw new Error(result.err as string);
      }
      return result;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["evidence"] });
      queryClient.invalidateQueries({
        queryKey: ["admin", "hidden-evidence", variables.password],
      });
    },
  });
}

// ── Reply Likes ───────────────────────────────────────────────────────────────

export function useLikeReply() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      replyId,
      sessionId,
    }: { replyId: bigint; sessionId: string; evidenceId?: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.likeReply(replyId, sessionId);
    },
    onSuccess: (
      _data: unknown,
      variables: { replyId: bigint; sessionId: string; evidenceId?: bigint },
    ) => {
      queryClient.invalidateQueries({
        queryKey: ["reply-likes", variables.replyId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["reply-like-session", variables.replyId.toString()],
      });
      if (variables.evidenceId != null) {
        queryClient.invalidateQueries({
          queryKey: ["reply-like-counts", variables.evidenceId.toString()],
        });
      }
    },
  });
}

export function useReplyLikeCount(replyId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["reply-likes", replyId?.toString()],
    queryFn: async () => {
      if (!actor || replyId === null) return 0n;
      return actor.getReplyLikeCount(replyId);
    },
    enabled: !!actor && !isFetching && replyId !== null,
  });
}

export function useSessionLikeForReply(
  replyId: bigint | null,
  sessionId: string | null,
) {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["reply-like-session", replyId?.toString(), sessionId],
    queryFn: async () => {
      if (!actor || replyId === null || !sessionId) return false;
      return actor.getSessionLikeForReply(replyId, sessionId);
    },
    enabled: !!actor && !isFetching && replyId !== null && !!sessionId,
  });
}

export function useReplyLikeCounts(evidenceId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Record<string, number>>({
    queryKey: ["reply-like-counts", evidenceId?.toString()],
    queryFn: async () => {
      if (!actor || evidenceId === null) return {};
      const counts: Array<[bigint, bigint]> =
        await actor.getReplyLikeCounts(evidenceId);
      const result: Record<string, number> = {};
      for (const [id, count] of counts) {
        result[id.toString()] = Number(count);
      }
      return result;
    },
    enabled: !!actor && !isFetching && evidenceId !== null,
    staleTime: 10_000,
  });
}
