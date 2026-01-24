# iCaffe Online Store

iCaffe is a modern, API-first e-commerce platform built as a multi-vertical catalog and ordering system. This repository contains the Next.js frontend application that serves distinct storefronts:

* **Nursery (משתלה):** A plant catalog and ordering interface for "Sfat HaMidbar" (Heart of the Dessert).
* **Bakery (מאפייה):** A showcase for artisan breads and pastries ("LaSha Bakery").
* **Maya:** Integration with our advanced AI Agent.

This project is optimized for high performance, ease of use, and deep integration with the iCaffe backend infrastructure.

---

## 🚀 Tech Stack

* **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **UI Library:** [React 19](https://react.dev/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Animations:** [Framer Motion](https://www.framer.com/motion/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **Database & Auth:** [Supabase](https://supabase.com/)
* **Local Persistence:** [Dexie.js](https://dexie.org/) (IndexedDB wrapper)
* **Maps:** [Leaflet](https://leafletjs.com/)

---

## 🏗️ Project Structure

The project follows the standard Next.js App Router structure with localized features:

```
app/
├── bakery/             # Bakery storefront implementation
│   ├── components/     # Bakery-specific UI components
│   └── page.tsx        # Bakery landing page
├── nursery/            # Nursery storefront implementation
│   ├── components/     # Nursery-specific UI components (PlantCard, Hero, Filters)
│   └── page.tsx        # Nursery catalog page
├── maya/               # Maya AI Agent interface
├── shop/               # General shopping cart and checkout flows
├── global-error.tsx    # Global error handling
├── layout.tsx          # Root layout (fonts, metadata, providers)
└── page.tsx            # Main entry point (Store selection)
```

### Key Components

* **`StoreFooter`**: A shared footer component that adapts its theme based on the active store (`nursery` vs `bakery`).
* **`WhatsAppButton`**: A floating action button for direct communication with the business.
* **`PlantCard` / `BakeryProductCard`**: Specialized product cards optimized for their respective verticals.

---

## 🔌 API & Backend

This frontend consumes the [iCaffe Backend API](./API_DOCUMENTATION.md).

* **Database:** PostgreSQL (via Supabase)
* **Logic:** Heavily relies on PostgreSQL **RPCs** (Remote Procedure Calls) for transactional integrity.
* **Key RPCs:**
  * `submit_order_v3`: Handles complex order submission logic including inventory checks.
  * `lookup_customer`: Retrieves customer loyalty profiles.

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed backend specs.

---

## 🛠️ Setup & Installation

1. **Clone the repository:**

    ```bash
    git clone https://github.com/your-org/onlinestore.git
    cd onlinestore
    ```

2. **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    ```

3. **Environment Variables:**
    Create a `.env.local` file in the root directory and add your Supabase credentials:

    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

    *(Note: The project defaults to hardcoded business IDs for specific stores in the source code if not provided via env, primarily for the Sfat HaMidbar deployment).*

4. **Run Development Server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🌟 Features

* **Vertical-Specific UX:** Distinct themes and layouts for the Nursery (Emerald/Nature theme) and Bakery (Amber/Warm theme).
* **Advanced Filtering:** Filter products by categories, availability, and specific attributes (e.g., "Trees & Shrubs").
* **Performance:** Optimized with `useMemo` for filtering logic and skeleton loaders for data fetching.
* **Hebrew Support:** Built-in RTL support and Hebrew typography (`Heebo` font).
* **Mobile First:** Responsive design optimized for mobile browsing.

---

## 📝 Latest Changes

* **Nursery Catalog:** Implemented complete catalog view with category filters and search.
* **Code Review:** See [GROK_CODE_REVIEW.md](./GROK_CODE_REVIEW.md) for internal audit notes and optimization tasks.
* **AI Integration:** Initial scaffold for "Maya" agent.

---

*Powered by iCaffe* ☕
