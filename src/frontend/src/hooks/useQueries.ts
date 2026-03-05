import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Claim, Evidence } from "../backend.d";
import { useActor } from "./useActor";

// ── Session ──────────────────────────────────────────────────────────────────

const SESSION_KEY = "claim_verifier_session_id";

export function getOrInitSessionId(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function saveSessionId(id: string): void {
  localStorage.setItem(SESSION_KEY, id);
}

export function useSessionId() {
  const { actor, isFetching } = useActor();

  return useQuery<string>({
    queryKey: ["sessionId"],
    queryFn: async () => {
      const existing = localStorage.getItem(SESSION_KEY);
      if (existing) return existing;
      if (!actor) throw new Error("No actor");
      const id = await actor.generateSessionId();
      localStorage.setItem(SESSION_KEY, id);
      return id;
    },
    enabled: !!actor && !isFetching,
    staleTime: Number.POSITIVE_INFINITY,
  });
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
      return actor.createClaim(
        title,
        description,
        category,
        sessionId,
        imageUrls,
        urls,
      );
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
    }: {
      claimId: bigint;
      sessionId: string;
      text: string;
      imageUrls?: string[];
      urls?: string[];
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.submitEvidence(claimId, sessionId, text, imageUrls, urls);
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
    }: {
      evidenceId: bigint;
      sessionId: string;
      direction: string;
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
    },
  });
}
