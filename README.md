# Swiggy MCP Smart Meal Planner & Cooking To-Do Generator

An interactive Next.js application built on top of the **Swiggy Model Context Protocol (MCP)** specification. This application generates personalized cooking to-do lists based on the user's daily schedule, produces breakfast/lunch/dinner meal plans, compiles a real-time grocery list matching products on **Swiggy Instamart**, evaluates budget feasibility, and performs automated cost-effective substitutions.

---

## 1. Vertical Chosen
**Vertical: Smart Kitchen Commerce & Meal Planning Automation**
Integrating daily personal task management with instant grocery delivery checkout via the Swiggy Instamart MCP tool chain.

---

## 2. Approach & Logic

### Standard OAuth 2.1 with PKCE & Dynamic Client Registration (DCR)
The application implements the official Swiggy MCP security protocol:
- **DCR (`/api/auth/login`)**: Automatically registers the client with Swiggy's `/auth/register` (RFC 7591) using the dynamic host redirect callback (`/api/auth/callback`).
- **PKCE S256**: Generates cryptographically secure `code_verifier` and `code_challenge` inputs, matching state values to mitigate CSRF vectors.
- **Token Exchange**: Handles the token exchange callback using secure HTTP-only cookies to store session details without manual DB requirements.
- **Mock Bypass Fallback**: Built-in sandbox mode for offline or verification-driven execution.

### Swiggy MCP Hybrid API Router (`/api/mcp`)
A unified JSON-RPC proxy endpoint:
- **Authenticated Mode**: Automatically forwards incoming tools (`search_products`, `update_cart`, `checkout`) directly to the Swiggy production/staging servers (`https://mcp.swiggy.com/im`) using the user's `Authorization: Bearer <access_token>` header.
- **Sandbox Mode**: Resolves requests locally using the catalog fallback if no active Swiggy OAuth token is configured.

### Algorithmic Meal Planner & Budget Optimization
- **Day Schedule Mapping**: Translates user schedules (Busy, Moderate, Free) into cooking time budgets.
- **Diet-Tailored Recipes**: Returns structured breakfast, lunch, and dinner recipes categorized by Balanced, Vegetarian, or High-Protein nutrition.
- **Cooking Timeline Engine**: Dynamically calculates and orders time-stamped culinary tasks (e.g. prep times, cooking steps) corresponding to the user's daily schedule slots.
- **Auto-Substitution Engine**: Uses the product's alternative substitution metadata (e.g. premium ingredients like Organic Almond Milk replaced with regular Cow Milk, or Avocado replaced with Banana) to programmatically lower the bill. It constructs a new payload, updates the cart, and renders the updated feasible budget.

---

## 3. How the Solution Works

### Step-by-Step Execution
1. **User Auth**: Click "Connect Swiggy Account" to login via the real Swiggy OAuth interface (or click Sandbox Bypass to run offline).
2. **Setup Inputs**: Input your daily schedule profile (e.g., Busy Day), dietary preference (e.g., High-Protein), and budget (e.g., ₹400).
3. **Generate Trigger**: Click "Generate Meal Plan & To-Do".
4. **MCP Product Sync**: The application queries the MCP server `search_products` for each meal's ingredients.
5. **Cart Optimization**: The cart is updated on the MCP server via `update_cart`. The frontend displays the live cart and checks budget feasibility.
6. **Auto-Substitution**: If the cart is over budget, click the **"Substitute Items"** button to swap out premium products for cost-effective alternatives.
7. **Delivery Confirmation**: Click "Place Swiggy Order" to call the `checkout` tool and confirm delivery to the user's saved address.
