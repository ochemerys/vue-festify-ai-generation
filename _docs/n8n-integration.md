# Integrating with an n8n workflow

| Feature | MCP | A2A | ACP | 
| :--- | :--- | :--- | :--- | 
| Primary Role | Standardized Tool Access (I/O) | Logic & Role Distribution | State/UI Synchronization | 
| Best For | Letting AI read/write files & run tests. | Separating concerns (QA vs. Dev). | Collaborative UI tools. | 
| n8n Fit | Native. Maps tooling to nodes. | Structural. Maps to workflow logic. | Irrelevant. n8n is headless. | 
| Recommendation | MUST HAVE | Nice to have (Layer on top) | Ignore |

## Detailed Comparison

To understand why MCP wins, we must look at how each approach addresses your three specific requirements: n8n Integration, Monorepo Management, and the TDD/BDD Loop.

1. n8n Integration

    - MCP (The "Hands"):
        - Fit: Excellent. n8n is an orchestrator designed to call external services. MCP standardizes these calls. Instead of writing custom scripts for every action, you treat your environment (File System, Git, Terminal) as an "MCP Server."
        - Mechanism: The AI node in n8n uses MCP to say, "I need to read packages/ui/button.ts," or "Run the test suite." The protocol ensures the output (code, logs, errors) handles data types consistently.
    - A2A (The "Brains"):
        - Fit: Good (as a pattern). n8n can easily act as the router between different AI agents (e.g., Node A acts as the "Architect," passes context to Node B, the "Developer").
        - Limitation: A2A defines who is talking, not how they touch the system. Without a protocol like MCP, your "agents" are just text generators trapped in a box, unable to actually write files or run tests.
    - ACP (The "View"):
        - Fit: Poor. ACP focuses on syncing state for user interfaces (like a collaborative IDE). Since n8n is a background workflow engine, there is no "view" to keep in sync.

2. TypeScript Monorepo Context

    - MCP:
        - Allows the AI to dynamically discover project structure. Use tools like list_directory or read_package_json to understand workspaces (yarn/npm/pnpm).
        - Enables safe, targeted edits across multiple packages without hallucinating file paths.
    - A2A:
        - Useful for handling complexity. You might assign one agent to "Shared Components" and another to "Backend API" to avoid context overload. However, both still need MCP to read the actual files.
    - ACP:
        - Does not solve filesystem or dependency context issues.

3. TDD/BDD Approach (Red-Green-Refactor)

    - MCP:
        This is the critical piece. TDD requires a distinct feedback loop: Action (Write Test) → Execution (Run Shell Command) → Observation (Read Error Logs).
        MCP provides the standard interface for that Execution step. It allows the n8n workflow to run a command (e.g., npm test) and feed the structured output back to the LLM so it can iterate on the code.
    - A2A:
        Can model the TDD process well (e.g., a "QA Agent" generating Gherkin specs and a "Dev Agent" writing implementation). Ideally, you would simulate this interaction within the n8n workflow.

## The Verdict: Architecture Recommendation

The Council recommends a Hybrid Approach where MCP is the technical foundation and A2A is the logical structure.

- Primary Layer: MCP (Required) You should implement or use an existing MCP Server connected to your repository. This gives your n8n AI nodes the ability to:

    - File System: read_file, write_file, search_files (essential for Monorepo navigation).
    Command Execution: run_command (essential for running Jest/Vitest/Cucumber).

- Secondary Layer: A2A (Optional/Advanced) Once MCP is handling the I/O, you can structure your n8n workflow using an A2A pattern:

    - Node A (Spec Agent): Receives the user prompt and generates a Feature file (using MCP to save it).
    - Node B (Test Agent): Reads the Feature file (via MCP) and generates a failing test (via MCP).
    - Node C (Coder Agent): Reads the failure (via MCP) and writes the TypeScript implementation (via MCP).
    - Loop: If the standard run_test tool returns failure, route back to Node C.
