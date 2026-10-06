const CLAUDE_CODE = `┌──────────────────────┬────────────────┬──────────────┬───────────────┬────────────────────────────────────┬───────────┐
│  Deployment option   │  Monthly cost  │  Setup time  │   Scales to   │           Main trade-off           │  Lock-in  │
│                      │                │              │               │                                    │   risk    │
├──────────────────────┼────────────────┼──────────────┼───────────────┼────────────────────────────────────┼───────────┤
│ Single VPS           │ $12            │ 1 hour       │ ~1k req/s     │ you patch the OS and handle        │ low       │
│                      │                │              │               │ backups yourself                   │           │
├──────────────────────┼────────────────┼──────────────┼───────────────┼────────────────────────────────────┼───────────┤
│ Managed containers   │ $45            │ half a day   │ ~10k req/s    │ cold starts on the cheapest tier   │ medium    │
├──────────────────────┼────────────────┼──────────────┼───────────────┼────────────────────────────────────┼───────────┤
│ Kubernetes           │ $180 + node    │ 1–2 weeks    │ practically   │ needs someone who knows            │ low       │
│ (managed)            │ costs          │              │ unlimited     │ Kubernetes on call                 │           │
├──────────────────────┼────────────────┼──────────────┼───────────────┼────────────────────────────────────┼───────────┤
│ Serverless           │ $0–60          │ 2 hours      │ automatic     │ 15-minute execution limit,         │ high      │
│ functions            │                │              │               │ vendor-specific APIs               │           │
├──────────────────────┼────────────────┼──────────────┼───────────────┼────────────────────────────────────┼───────────┤
│ PaaS                 │ $25 per dyno   │ 30 minutes   │ ~5k req/s     │ gets expensive fast                │ medium    │
└──────────────────────┴────────────────┴──────────────┴───────────────┴────────────────────────────────────┴───────────┘`

const ROUNDED_EMOJI = `╭─────────────────┬────────┬─────────┬───────────────────────────╮
│ Feature         │ Free   │ Pro     │ Notes                     │
├─────────────────┼────────┼─────────┼───────────────────────────┤
│ Private repos   │ ✅     │ ✅      │                           │
│ CI minutes      │ 2,000  │ 3,000   │ per month                 │
│ Code owners     │ ❌     │ ✅      │ required for protected    │
│                 │        │         │ branches                  │
│ Support         │ Forum  │ Email   │ 24h response on Pro       │
╰─────────────────┴────────┴─────────┴───────────────────────────╯`

const MYSQL = `mysql> SELECT id, name, plan, created_at FROM customers LIMIT 4;
+----+----------------+------------+---------------------+
| id | name           | plan       | created_at          |
+----+----------------+------------+---------------------+
|  1 | Acme Corp      | enterprise | 2026-01-14 09:12:44 |
|  2 | Globex         | pro        | 2026-02-03 17:40:01 |
|  3 | Initech        | free       | 2026-03-22 11:05:37 |
|  4 | Umbrella, Inc. | pro        | 2026-04-09 08:30:00 |
+----+----------------+------------+---------------------+
4 rows in set (0.01 sec)`

const MARKDOWN = `| Command | What it does | Safe to re-run? |
|---|---|:---:|
| \`git fetch\` | Downloads new commits, leaves your branch alone | Yes |
| \`git pull --rebase\` | Fetches, then replays your commits on top | Usually |
| \`git log --oneline \\| head\` | Shows the last 10 commits, one per line | Yes |
| \`git reset --hard\` | Discards **all** local changes<br>Cannot be undone | No |`

const DOCKER = `CONTAINER ID   IMAGE                  COMMAND                  STATUS          PORTS                    NAMES
3f2a9c1d7b8e   postgres:16            "docker-entrypoint.s…"   Up 3 hours      0.0.0.0:5432->5432/tcp   db
a81c44e0f913   redis:7-alpine         "redis-server"           Up 3 hours      6379/tcp                 cache
c0de5ee1ab42   ghcr.io/acme/api:2.4   "node server.js"         Up 12 minutes   0.0.0.0:8080->8080/tcp   api`

const AGENT_REPLY = `⏺ I compared the two queue options. Throughput first:

  ┌──────────┬────────────┬─────────────┐
  │ Queue    │ Msgs / sec │ p99 latency │
  ├──────────┼────────────┼─────────────┤
  │ SQS      │ ~3,000     │ 120 ms      │
  ├──────────┼────────────┼─────────────┤
  │ RabbitMQ │ ~20,000    │ 8 ms        │
  └──────────┴────────────┴─────────────┘

  And the operational side:

  ┌──────────┬──────────────────┬─────────────────────┐
  │ Queue    │ Who runs it      │ Monthly cost (est.) │
  ├──────────┼──────────────────┼─────────────────────┤
  │ SQS      │ AWS (managed)    │ $40                 │
  ├──────────┼──────────────────┼─────────────────────┤
  │ RabbitMQ │ Us, on 3 EC2     │ $210 + on-call time │
  │          │ instances        │                     │
  └──────────┴──────────────────┴─────────────────────┘

  My recommendation: stay on SQS unless we need sub-10 ms latency.`

export const EXAMPLES = [
  { label: 'Claude Code table with wrapped cells', text: CLAUDE_CODE },
  { label: 'Rounded box table with emoji', text: ROUNDED_EMOJI },
  { label: 'MySQL query result', text: MYSQL },
  { label: 'Markdown table (ChatGPT, Codex)', text: MARKDOWN },
  { label: 'docker ps (space-aligned)', text: DOCKER },
  { label: 'Agent reply with two tables', text: AGENT_REPLY },
]
