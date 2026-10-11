# BẢN GIAO THIẾT KẾ UI/UX — MÀN THANH TOÁN & ÁP MÃ VOUCHER

- **Dự án**: ShopGo — Hệ thống Thương mại điện tử
- **Tính năng**: Function D — Áp dụng Mã Giảm Giá (Voucher)
- **Người giao**: UI/UX Designer → QA
- **Bản**: v2.0 · Khung màn hình desktop 1280×800
- **Figma**: `https://figma.com/file/shopgo-checkout-v2` *(link mẫu cho lớp học — không mở được)*
- **Phân loại**: `04_design` — bản vẽ để `qa-ui-review` đối chiếu với giao diện thật

> **Dùng thế nào**: đây là **chuẩn mực** (baseline). Chặng 08 chụp màn hình thật rồi soi
> ngược lại từng mục dưới đây. Lệch chuẩn thì ghi vào `08_ui_screenshot_analysis.md` kèm
> mã mục bị vi phạm (ví dụ `vi phạm DS-03`), để Dev/Designer verify lại được sau khi sửa.

---

## 1. Design Tokens — Màu

| Mã | Token | Giá trị | Dùng ở đâu |
|---|---|---|---|
| DS-01 | `--brand-primary` | `#F97316` (cam) | Nút chính, mã voucher, giá tiền tổng |
| DS-02 | `--text-body` | `#1F2937` trên nền `#FFFFFF` | Thân bài — tỉ lệ tương phản 15.3:1 |
| DS-03 | `--text-muted` | `#6B7280` trên nền `#FFFFFF` | Nhãn phụ — **tối thiểu 4.5:1**, không được nhạt hơn |
| DS-04 | `--state-error` | `#DC2626`, nền `#FEF2F2` | Thông báo lỗi |
| DS-05 | `--state-success` | `#15803D`, nền `#F0FDF4` | Thông báo thành công, nhãn Freeship |
| DS-06 | `--state-disabled` | Chữ `#9CA3AF`, nền `#F3F4F6` | Phần tử đã vô hiệu hoá |

**Luật màu**: không bao giờ dùng **màu là tín hiệu duy nhất**. Mọi trạng thái lỗi / thành công
phải kèm biểu tượng hoặc chữ. (Chuẩn WCAG 2.1 — 1.4.1 Use of Color)

## 2. Design Tokens — Chữ

| Mã | Vai trò | Họ chữ | Cỡ | Ghi chú |
|---|---|---|---|---|
| DS-07 | Tiêu đề thẻ | Sans-serif, 600 | 18px | **Một họ chữ duy nhất cho toàn bộ chữ giao diện** |
| DS-08 | Thân bài | Sans-serif, 400 | 14px | |
| DS-09 | Nhãn phụ | Sans-serif, 400 | 13px | **Không viết hoa toàn bộ** quá 3 từ — giảm tốc độ đọc |
| DS-10 | Số tiền & mã voucher | Monospace, 500 | 14–20px | Monospace là **có chủ đích**: canh cột số thẳng hàng |

> Ngoại lệ duy nhất được dùng họ chữ khác là logo "ShopGo" ở header.

## 3. Khoảng cách & Đích chạm

| Mã | Quy tắc |
|---|---|
| DS-11 | Đơn vị khoảng cách là bội số của 4px. Padding trong thẻ: 24px. |
| DS-12 | Mọi phần tử bấm được có đích chạm **tối thiểu 44×44px**. |
| DS-13 | Hai phần tử bấm được có hậu quả **trái ngược nhau** (xoá ↔ gửi đi) phải cách nhau **tối thiểu 8px**. |
| DS-14 | Nút chỉ có biểu tượng bắt buộc có `aria-label` và tooltip chữ khi di chuột. |

---

## 4. Thành phần: Ô nhập mã voucher

```
┌──────────────────────────────────────┐ ┌───────────┐
│ Nhập mã giảm giá                   × │ │  Áp dụng  │
└──────────────────────────────────────┘ └───────────┘
   ↑ placeholder DS-09        ↑ nút xoá    ↑ nút chính DS-01
                              cách nút Áp dụng ≥ 8px (DS-13)
```

| Mã | Trạng thái | Thể hiện |
|---|---|---|
| CP-01 | Mặc định | Viền `#E5E7EB`, placeholder "Nhập mã giảm giá" |
| CP-02 | Đang gõ (focus) | Viền `--brand-primary`, bóng cam mờ |
| CP-03 | **Sai khuôn dạng** | Viền `--state-error` **ngay khi gõ**, không đợi bấm Áp dụng |
| CP-04 | Đã áp thành công | Ô khoá lại, hiện chip mã kèm nút "Gỡ mã" |

**CP-03 là bắt buộc**: khuôn dạng mã là `^[A-Z0-9]{3,20}$`. Chuỗi không khớp phải báo
**ngay tại ô nhập**, trước khi người dùng mất công bấm nút.

## 5. Thành phần: Chip mã có sẵn

| Mã | Trạng thái | Thể hiện |
|---|---|---|
| CP-05 | Dùng được | Nền trắng, viền `#E5E7EB`, mã màu `--brand-primary`, con trỏ bấm được |
| CP-06 | **Hết hạn / không đủ điều kiện** | Token `--state-disabled`: chữ xám, nền xám, **gạch ngang mã**, con trỏ `not-allowed`, **không bấm được** |

> **Luật luồng**: danh sách "bấm để áp dụng nhanh" **chỉ được mời** những mã người dùng
> thực sự dùng được ngay lúc đó. Mã hết hạn hoặc chưa đủ điều kiện phải mang trạng thái
> CP-06 và **xếp xuống cuối danh sách** kèm nhãn lý do. Không bao giờ mời bấm một thứ
> chắc chắn thất bại.

## 6. Thành phần: Mô tả mã khuyến mại

| Mã | Quy tắc |
|---|---|
| CP-07 | Mô tả **không được cắt cụt bằng dấu ba chấm** ở phần chứa điều kiện hoặc mức trần. Thiếu chỗ thì xuống dòng. |
| CP-08 | Thứ tự thông tin: **mức giảm → mức trần → điều kiện**. Ví dụ đúng: *"Giảm 20%, tối đa 100.000 đ, đơn từ 300.000 đ."* |

---

## 7. Thành phần: Bảng Chi tiết thanh toán

| Mã | Quy tắc |
|---|---|
| CP-09 | Dòng **"Giảm giá voucher" chỉ hiện khi số tiền giảm khác 0**. Không hiện dòng `0 đ`. |
| CP-10 | Khi mức giảm lý thuyết bị cắt bởi mức trần, **bắt buộc** hiện hộp ghi chú giải thích phép tính. Mẫu: *"Tạm tính {X} × {Y}% = {Z} đ. Chiết khấu được áp mức trần tối đa {T} đ."* |
| CP-11 | "Tổng thanh toán" là số lớn nhất màn hình, màu `--brand-primary`, font DS-10. |

## 8. Huy hiệu số lượng giỏ hàng

| Mã | Quy tắc |
|---|---|
| CP-12 | **Chỉ một cách đếm trên toàn hệ thống**: huy hiệu đếm **tổng số món** (cộng dồn số lượng), không đếm số loại sản phẩm. |
| CP-13 | Huy hiệu trên thanh điều hướng và nhãn trong thẻ giỏ hàng **phải luôn khớp nhau**. Muốn nói rõ cả hai thì ghi `"{số loại} loại · {số món} món"`. |

> Đây là lỗi hay gặp nhất khi hai nhóm Dev làm hai thành phần riêng. Bắt buộc dùng chung
> một hàm đếm.

---

## 9. Danh mục thông báo (Message Catalogue)

Bảng này là **chuẩn chữ nghĩa**. Dev không được tự chế lời thông báo.

| Mã | Tình huống | Nội dung bắt buộc | Loại |
|---|---|---|---|
| MSG-01 | Sai khuôn dạng (có ký tự lạ, emoji, quá ngắn/dài) | *"Mã chỉ gồm chữ in hoa và số, dài 3–20 ký tự."* | Lỗi |
| MSG-02 | Đúng khuôn dạng nhưng không có trong hệ thống | *"Mã giảm giá "{mã}" không tồn tại."* | Lỗi |
| MSG-03 | Mã có thật nhưng đã hết hạn | *"Mã giảm giá "{mã}" đã hết hạn sử dụng."* + gợi ý mã thay thế đang dùng được | Lỗi |
| MSG-04 | Chưa đạt mức sàn | *"Đơn hàng cần tối thiểu {X} đ để dùng mã này. Còn thiếu {Y} đ."* | Cảnh báo |
| MSG-05 | Áp thành công | *"Áp dụng thành công mã "{mã}": {mô tả mức giảm}."* | Thành công |

**Luật MSG quan trọng nhất**: **MSG-01 và MSG-02 không được gộp làm một.** Sai khuôn dạng là
lỗi người dùng gõ nhầm — họ cần sửa ký tự. Không tồn tại là mã sai hẳn — họ cần đi xin mã
khác. Báo nhầm loại là đẩy người dùng đi sai hướng khắc phục.

**Luật MSG-03**: mọi thông báo lỗi phải kèm **một bước tiếp theo làm được ngay**, không
dừng ở việc nêu nguyên nhân.

---

## 10. Chuẩn Accessibility phải đạt

| Mã | Yêu cầu | Căn cứ |
|---|---|---|
| AX-01 | Tương phản chữ thường ≥ **4.5:1**, chữ lớn ≥ **3:1** | WCAG 2.1 AA — 1.4.3 |
| AX-02 | Không dùng màu làm tín hiệu duy nhất | WCAG 2.1 A — 1.4.1 |
| AX-03 | Mọi nút chỉ có biểu tượng đều có nhãn chữ cho trình đọc màn hình | WCAG 2.1 A — 4.1.2 |
| AX-04 | Đích chạm ≥ 44×44px | WCAG 2.1 AAA — 2.5.5 |
| AX-05 | Thông báo lỗi phải được trình đọc màn hình công bố (`role="alert"`) | WCAG 2.1 A — 4.1.3 |
| AX-06 | Không nhúng emoji hoặc ký tự trang trí vào nội dung thông báo | Trình đọc sẽ đọc to tên emoji |

---

## 11. Ảnh bản vẽ kèm theo

> **Ghi chú cho lớp học**: bản giao này cố ý **chỉ có chữ, không có ảnh mockup**.
> Dự án thật sẽ có thêm `.png` / `.jpg` export từ Figma đặt cạnh file này. Chặng 08 đối
> chiếu được cả hai dạng — nhưng bảng token và danh mục thông báo ở trên mới là thứ cho
> phép kết luận *"lệch chuẩn"* thay vì *"nhìn hơi xấu"*.

| Tên ảnh dự kiến | Màn hình |
|---|---|
| `mockup_checkout_default.png` | Thanh toán — chưa áp mã |
| `mockup_voucher_success.png` | Đã áp mã thành công, có hộp ghi chú maxCap |
| `mockup_voucher_error.png` | Trạng thái lỗi, đủ 5 biến thể MSG-01 → MSG-05 |
| `mockup_chip_states.png` | Chip mã: dùng được (CP-05) vs hết hạn (CP-06) |
