export type CommitLookupResult =
  | { kind: 'success'; message: string; author: string }
  | { kind: 'private_or_unavailable' }
  | { kind: 'invalid_input' };

type ParsedCommitRef = { owner: string; repo: string; sha: string };

function parseGithubCommitReference(input: string): ParsedCommitRef | null {
  const value = input.trim();
  if (!value) return null;

  const urlMatch = value.match(
    /^https?:\/\/(?:www\.)?github\.com\/([^/\s]+)\/([^/\s]+)\/commit\/([a-fA-F0-9]{7,40})/,
  );
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/i, ''), sha: urlMatch[3] };
  }

  const shortMatch = value.match(/^([^/\s]+)\/([^@\s]+)@([a-fA-F0-9]{7,40})$/);
  if (shortMatch) {
    return {
      owner: shortMatch[1],
      repo: shortMatch[2].replace(/\.git$/i, ''),
      sha: shortMatch[3],
    };
  }

  return null;
}

export async function fetchGithubCommitPreview(input: string): Promise<CommitLookupResult> {
  const parsed = parseGithubCommitReference(input);
  if (!parsed) return { kind: 'invalid_input' };

  const endpoint = `https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}/commits/${encodeURIComponent(parsed.sha)}`;
  const response = await fetch(endpoint, {
    headers: { Accept: 'application/vnd.github+json' },
  });

  if (response.status === 404 || response.status === 403) {
    return { kind: 'private_or_unavailable' };
  }
  if (!response.ok) {
    throw new Error('Failed to fetch commit metadata');
  }

  const payload = (await response.json()) as {
    commit?: { message?: string; author?: { name?: string } };
    author?: { login?: string };
  };

  const message = payload.commit?.message?.split('\n')[0]?.trim() || 'No commit message available';
  const author = payload.commit?.author?.name?.trim() || payload.author?.login?.trim() || 'Unknown author';
  return { kind: 'success', message, author };
}
