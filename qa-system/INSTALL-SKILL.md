
## Cài đặt skill cho các Agent Coding AI trong Antigravity IDE

### Mô tả 
- Đây là các skill được viết riêng cho các Antigravity Agent Coding.
- Phù hợp với các Agent Coding đang có trên thị trường, ví dụ như:
  - Claude Code
  - Codex
  - Github Copilot
  - Cursor
  - Hệ sinh thái Agent của Google: Antigravity (IDE), Gemini, Gemini CLI, ...
  - ... và các Agent Coding khác.

### Ponytail
```bash
npx skills add dietrichgebert/ponytail -a antigravity
```

> **Phạm vi dùng Ponytail**: chỉ khi **sửa code công cụ** trong `qa-system/tools/*.js`. Không dùng cho các chặng
> 01→06, POM, hay khi nâng cấp skill/agent: Ponytail ưu tiên "làm bản gọn rồi hỏi sau", còn hệ thống này bắt
> **dừng và hỏi** khi thiếu thông tin (cổng ASK, `qa-system/core/QA_STANDARD.md` §1).
