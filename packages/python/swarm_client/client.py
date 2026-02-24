"""Swarm AI Python Client"""
from __future__ import annotations
import httpx
from typing import Any


class SwarmClient:
    """Minimal client for the Swarm AI API."""

    def __init__(self, base_url: str = "http://localhost:3777", api_key: str = ""):
        self.base = base_url.rstrip("/") + "/api/v1"
        self._h = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
        self._c = httpx.Client(headers=self._h, timeout=30)

    def close(self):
        self._c.close()

    def __enter__(self):
        return self

    def __exit__(self, *_):
        self.close()

    def _r(self, resp: httpx.Response) -> Any:
        resp.raise_for_status()
        return resp.json()

    # --- Profile ---
    def get_profile(self, layer: str | None = None, tag: str | None = None) -> dict:
        p = {k: v for k, v in {"layer": layer, "tag": tag}.items() if v}
        return self._r(self._c.get(f"{self.base}/profile", params=p))

    def set_profile(self, layer: str, entries: dict) -> dict:
        return self._r(self._c.patch(f"{self.base}/profile", json={"layer": layer, "entries": entries}))

    def delete_profile(self, layer: str, key: str) -> dict:
        return self._r(self._c.request("DELETE", f"{self.base}/profile", json={"layer": layer, "key": key}))

    def observe(self, observations: list[dict]) -> dict:
        return self._r(self._c.post(f"{self.base}/profile/observe", json={"observations": observations}))

    # --- Memory ---
    def search_memory(self, q: str | None = None, mode: str | None = None, **kw) -> list:
        p = {k: v for k, v in {"q": q, "mode": mode, **kw}.items() if v}
        return self._r(self._c.get(f"{self.base}/memory", params=p))

    def add_memory(self, content: str, **kw) -> dict:
        return self._r(self._c.post(f"{self.base}/memory", json={"content": content, **kw}))

    def delete_memory(self, id: int) -> dict:
        return self._r(self._c.request("DELETE", f"{self.base}/memory", json={"id": id}))

    # --- Webhooks ---
    def list_webhooks(self) -> list:
        return self._r(self._c.get(f"{self.base}/webhooks"))

    def add_webhook(self, url: str, events: str = "*") -> dict:
        return self._r(self._c.post(f"{self.base}/webhooks", json={"url": url, "events": events}))

    def delete_webhook(self, id: int) -> dict:
        return self._r(self._c.request("DELETE", f"{self.base}/webhooks", json={"id": id}))

    # --- Persona ---
    def get_persona(self, agent_id: str | None = None) -> dict:
        path = f"/persona/{agent_id}" if agent_id else "/persona/me"
        return self._r(self._c.get(f"{self.base}{path}"))
