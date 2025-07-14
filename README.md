# 💸 Paisa App

> A radically fast, flow-based personal finance tracker.  
> Designed to **stay in the zone** — no clicks, no clutter, no friction.

---

## 🧠 Concept

**Paisa** reimagines how you enter personal finance data.  
Forget clunky forms and endless dropdowns.  
Inspired by **Vim**, **Typeform**, and **command palettes**, this app lets you log your finances **as fast as you think**.

---

## 🎯 Core Philosophy

- 🧭 **One line. One entry. One flow.**
- ⌨️ **Keyboard-first**. No tabbing. No mouse.
- 🧠 **Smart parsing**. Natural language style input.
- 📌 **Pin recurring context** like account, date, or tags — enter dozens of entries without repetition.
- 🗂 **Batch entries**. Log multiple transactions in one go.
- 🏹 **Arrow-key mode switch** — easily toggle between expense and income entry.

---

## ✨ Example Usage

### 🔹 A single entry:
```
> 150 coffee @Starbucks from HDFC on Apr 10 #food
```

### 🔹 Pin context:
```
> pin from HDFC on Apr 10 #food
```
Now just:
```
> 120 sandwich @Subway
> 200 tea @Chaayos
```

All inherit the pinned values.

### 🔹 Unpin:
```
> unpin all
```

### 🔹 Batch mode:
Paste multiple lines:
```
> 100 dosa @Sagar
> 80 juice @JuiceHub
> 60 vada @StreetStall
```

Boom — logged instantly.

### 🔹 Income entry:
```
< 10000 salary from Razorpay on Apr 7 #income
```

---

## 🔁 Entry Mode Controls

### 🧭 Markers
- Use `>` for **Expense** (default)
- Use `<` for **Income**

### ⌨️ Arrow Key Shortcuts
- `→` Right Arrow → Expense mode
- `←` Left Arrow → Income mode
- Optional: `Shift + Arrow` to **pin** mode across batch entries

### 🧠 Fallback Priority
1. Arrow key override (most recent)
2. Marker symbol (`>` or `<`)
3. Default: Expense

Live parser preview updates with mode changes.

---

## ⚙️ Tech Stack (Planned)

| Layer | Tech |
|-------|------|
| UI | React + Tailwind + Framer Motion |
| Input Parser | Custom / Nearley.js |
| Command Bar | [cmdk](https://cmdk.paco.me/) |
| Backend | Node.js + MongoDB |
| CLI (Optional) | Node + Inquirer.js |
| Charts | Recharts / Tremor |

---

## 🚧 MVP Features

- [ ] Command-style input
- [ ] Context pinning (account/date/tag)
- [ ] Real-time parser + preview
- [ ] Multi-line batch entry
- [ ] Undo/redo support
- [ ] Monthly summaries
- [ ] Offline-first support
- [ ] Sync with cloud
- [ ] Expense/income arrow key toggle

---

## 🧪 Inspirations

- **Vim** – for modal/flow thinking
- **Typeform** – for single-focus input design
- **Notion** – for minimal structure with flexibility
- **Raycast / Alfred** – for command palette UX
- **Linear** – for speed and polish

---

## 🚀 Getting Started (Coming Soon)

```bash
git clone https://github.com/AbhyasKanaujia/paisa_app.git
cd paisa-app
npm install
npm run dev
```

---

## 🙌 Contribute

Want to help design or build Paisa? Open an issue or ping me!  
We’re building this for humans who value **clarity, speed, and flow**.

---

## 📜 License

GPL-3.0-or-later

