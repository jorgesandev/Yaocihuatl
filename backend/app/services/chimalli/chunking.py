from __future__ import annotations

import re
from typing import Iterable, List


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def chunk_text(text: str, max_words: int = 220, overlap: int = 40) -> List[str]:
    words = normalize_text(text).split()
    if not words:
        return []
    chunks: List[str] = []
    step = max(max_words - overlap, 1)
    for start in range(0, len(words), step):
        chunk = " ".join(words[start : start + max_words])
        if chunk:
            chunks.append(chunk)
        if start + max_words >= len(words):
            break
    return chunks


def tokenize(text: str) -> set[str]:
    return {token for token in re.findall(r"[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9]+", text.lower()) if len(token) > 2}


def keyword_score(query: str, document: str) -> float:
    query_tokens = tokenize(query)
    document_tokens = tokenize(document)
    if not query_tokens or not document_tokens:
        return 0.0
    overlap = query_tokens.intersection(document_tokens)
    return len(overlap) / len(query_tokens)


def join_non_empty(parts: Iterable[str]) -> str:
    return " ".join(part for part in parts if part)
