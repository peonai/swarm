# swarm-ai-client

Python client for [Swarm AI](https://github.com/peonai/swarm) — cross-agent profile sync.

## Install

```bash
pip install swarm-ai-client
```

## Usage

```python
from swarm_client import SwarmClient

client = SwarmClient("http://localhost:3777", api_key="swarm_xxx")

# Read profile
profile = client.get_profile()

# Write profile
client.set_profile("preferences", {"theme": "dark", "lang": "zh"})

# Add memory
client.add_memory("User prefers dark mode", tags=["preference"])

# Search memory
results = client.search_memory("dark mode")

# Register webhook
client.add_webhook("https://example.com/hook", events="profile.updated,memory.created")
```
