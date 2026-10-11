# UI SCREENSHOT ANALYSIS — MÀN THANH TOÁN & ÁP MÃ VOUCHER (ShopGo)
Owner: qa-system/qa-ui-review/ui-screenshot-review · Nguồn: Ảnh chụp màn hình đính kèm · Verdict: PASS

> **Phạm vi**: 4 ảnh tĩnh chụp từ `runs/RUN-01_voucher-regression/evidence/`, độ phân giải 1280×800.
> Mọi nhận định dưới đây chỉ dựa trên thứ **nhìn thấy được trong ảnh**. Hành vi động
> (hover, animation, chuyển màn, phản hồi sau click) nằm ngoài phạm vi skill này.

| # | Ảnh | Trạng thái màn hình |
|---|---|---|
| 1 | `evidence/VCHR-003/01_PASS_result.png` | Đã áp SALE20 thành công, chạm trần maxCap |
| 2 | `evidence/VCHR-006/03_dien_ma_voucher_hethan.png` | Vừa gõ mã HETHAN, chưa bấm Áp dụng |
| 3 | `evidence/VCHR-006/04_PASS_result.png` | Đã bấm Áp dụng, mã hết hạn bị từ chối |
| 4 | `evidence/VCHR-023_FAIL.png` | Nhập mã chứa emoji và ký tự đặc biệt |

---

## Ảnh 1: Áp mã SALE20 thành công trên đơn 600.000 đ

### UI Inconsistency

| # | Vị trí | Mô tả (nhìn thấy) | Lý do | Mức độ | Đề xuất sửa |
|:---|:---|:---|:---|:---:|:---|
| UI-01 | Thanh điều hướng vs thẻ "Chi tiết giỏ hàng" | Huy hiệu trên nút **Thanh toán** hiện số **3**, trong khi huy hiệu ở đầu thẻ giỏ hàng ghi **"1 sản phẩm"**. Cùng một màn, hai con số khác nhau cho cùng một giỏ. | Người dùng không biết tin số nào. Thực tế là 1 loại sản phẩm × số lượng 3, nhưng không chỗ nào nói ra điều đó. | High | Thống nhất một cách đếm. Đề xuất: huy hiệu nav hiện tổng số món (3), thẻ giỏ hàng ghi rõ `"1 loại · 3 món"`. |
| UI-02 | Thẻ mã có sẵn, dòng SALE20 | Mô tả bị cắt cụt: `"Giảm 20% giá trị đơn hàng cho đơn từ 300.000 đ (Giảm tối ..."` — dấu ba chấm rơi đúng vào chỗ nói mức trần. | Mức trần tối đa chính là luật quan trọng nhất của mã này (BR-07). Cắt ngay tại đó khiến người dùng không biết trần là bao nhiêu trước khi áp. | Med | Cho dòng mô tả xuống 2 dòng, hoặc đưa mức trần lên trước: `"Giảm 20%, tối đa 100.000 đ, đơn từ 300.000 đ"`. |
| UI-03 | Toàn màn | Ba họ chữ cùng xuất hiện: tiêu đề thẻ dùng serif nghiêng ("Chi tiết giỏ hàng", "Mã khuyến mãi", "Chi tiết thanh toán"), thân bài dùng sans-serif, số tiền và mã dùng monospace. | Monospace cho số tiền là có chủ đích và hợp lý (canh cột). Serif nghiêng cho tiêu đề thì không thấy lý do chức năng, làm màn hình rời rạc. | Low | Giữ monospace cho số liệu; đưa tiêu đề thẻ về cùng họ sans-serif với thân bài. |

### Accessibility

| # | Vị trí | Mô tả | Lý do | Mức độ | Đề xuất sửa |
|:---|:---|:---|:---|:---:|:---|
| AC-01 | Nhãn `MÃ GIẢM GIÁ CÓ SẴN (BẤM ĐỂ ÁP DỤNG NHANH):` | Chữ in hoa toàn bộ, cỡ nhỏ nhất màn hình, màu xám nhạt trên nền trắng. | Chữ in hoa toàn bộ làm giảm tốc độ đọc; cộng thêm cỡ nhỏ và tương phản thấp thì đây là dòng khó đọc nhất màn, mà nó lại là chỉ dẫn thao tác. `[GIẢ ĐỊNH]` tỉ lệ tương phản cụ thể — không đo được từ ảnh, cần kiểm bằng công cụ. | Med | Bỏ in hoa toàn bộ, tăng cỡ chữ, đưa màu về mức đạt WCAG AA (≥ 4.5:1). |
| AC-02 | Nút thùng rác ở dòng sản phẩm | Chỉ có biểu tượng, không có nhãn chữ nhìn thấy được, cũng không có chữ thay thế hiển thị. | Hành động xoá là không hoàn tác được trong ảnh này. Người dùng screen-reader và người không quen biểu tượng đều phải đoán. `[GIẢ ĐỊNH]` về `aria-label` — ảnh tĩnh không cho biết có hay không, cần kiểm trong DOM. | Med | Thêm nhãn chữ hoặc tooltip "Xoá sản phẩm", và `aria-label` tương ứng. |
| AC-03 | Dòng "Phí vận chuyển: Miễn phí (Freeship)" | Chữ xanh lá nhạt trên nền trắng, nhạt hơn hẳn các dòng còn lại trong cùng bảng. | Thông tin tích cực nhưng vẫn là thông tin giá. `[GIẢ ĐỊNH]` tương phản dưới ngưỡng AA — cần đo. | Low | Đậm màu xanh xuống một bậc, hoặc dùng nhãn chip thay vì đổi màu chữ. |

### UX Problem

| # | Vị trí | Mô tả | Lý do | Mức độ | Đề xuất sửa |
|:---|:---|:---|:---|:---:|:---|
| UX-01 | Hộp ghi chú dưới dòng "Giảm giá voucher" | Có dòng giải thích đầy đủ: *"Tạm tính 600.000 đ × 20% = 120.000 đ. Chiết khấu của mã SALE20 được áp dụng mức trần tối đa là 100.000 đ."* | **Đây là điểm làm tốt**, ghi lại để không bị sửa mất. Người dùng hiểu ngay vì sao không được giảm 120.000 đ. | — | Giữ nguyên. Nên áp dụng cùng kiểu giải thích cho các trường hợp lỗi (xem UX-04). |

---

## Ảnh 2 & 3: Mã hết hạn HETHAN — trước và sau khi bấm Áp dụng

### UI Inconsistency

| # | Vị trí | Mô tả | Lý do | Mức độ | Đề xuất sửa |
|:---|:---|:---|:---|:---:|:---|
| UI-04 | Danh sách mã có sẵn | Chip `HETHAN` trình bày **y hệt** `GIAM50K` và `SALE20`: cùng viền, cùng màu chữ cam, cùng nền — dù mô tả bên cạnh ghi rõ "Mã giảm giá đã hết hạn sử dụng." | Hình thức nói "bấm được", chữ nói "không dùng được". Hình thức thắng, vì người dùng quét bằng mắt trước khi đọc. | Med | Cho chip hết hạn kiểu vô hiệu hoá: nền xám, chữ xám, gạch ngang mã, bỏ con trỏ bấm. |

### Accessibility

| # | Vị trí | Mô tả | Lý do | Mức độ | Đề xuất sửa |
|:---|:---|:---|:---|:---:|:---|
| AC-04 | Ô nhập mã (ảnh 2) | Nút `×` xoá nội dung nằm sát mép phải ô input, cách nút "Áp dụng" một khoảng hẹp. | Hai đích chạm cạnh nhau với hậu quả trái ngược: một cái xoá sạch, một cái gửi đi. Trên màn cảm ứng dễ bấm nhầm. `[GIẢ ĐỊNH]` kích thước đích chạm thực tế — cần đo trên thiết bị. | Med | Giãn khoảng cách giữa `×` và "Áp dụng" tối thiểu 8px, bảo đảm mỗi đích ≥ 44×44px. |
| AC-05 | Thông báo lỗi (ảnh 3) | Thông báo đỏ **có kèm biểu tượng cảnh báo**, không chỉ dựa vào màu. | **Điểm làm tốt**: người mù màu vẫn nhận ra đây là lỗi. | — | Giữ nguyên. |

### UX Problem

| # | Vị trí | Mô tả | Lý do | Mức độ | Đề xuất sửa |
|:---|:---|:---|:---|:---:|:---|
| UX-02 | Danh sách "BẤM ĐỂ ÁP DỤNG NHANH" | Mã đã hết hạn vẫn nằm trong danh sách mời bấm nhanh, và sau khi bấm thì nhận thông báo từ chối. | Hệ thống mời người dùng làm một việc mà chính nó biết chắc sẽ thất bại. Đây là lỗi thiết kế luồng, không phải lỗi hiển thị. | High | Hoặc ẩn mã hết hạn khỏi danh sách, hoặc giữ lại nhưng vô hiệu hoá hẳn và chuyển xuống cuối kèm nhãn "Đã hết hạn". |
| UX-03 | Thẻ "Chi tiết thanh toán" (cả 2 ảnh) | Dòng "Giảm giá voucher: 0 đ" luôn hiển thị kể cả khi chưa áp mã nào. | Dòng giá trị bằng 0 không mang thông tin, làm loãng bảng tiền — chỗ người dùng soi kỹ nhất. | Low | Ẩn dòng này khi chưa có voucher; chỉ hiện khi số tiền giảm khác 0. |
| UX-04 | Thông báo lỗi (ảnh 3) | *"Mã giảm giá "HETHAN" đã hết hạn sử dụng."* — nêu đúng nguyên nhân nhưng dừng ở đó, không gợi ý bước tiếp theo. | So với ảnh 1 (có hẳn một hộp giải thích cách tính), luồng lỗi được chăm sóc kém hơn hẳn luồng thành công. | Med | Thêm một câu hành động: *"Thử mã GIAM50K — giảm 50.000 đ cho đơn từ 200.000 đ."* |

---

## Ảnh 4: Nhập mã chứa emoji và ký tự đặc biệt (`SALE🎉@#$`)

### UI Inconsistency

| # | Vị trí | Mô tả | Lý do | Mức độ | Đề xuất sửa |
|:---|:---|:---|:---|:---:|:---|
| UI-05 | Ô nhập mã | Chuỗi `SALE🎉@#$` được giữ nguyên trong ô, kể cả emoji màu. Các mã hợp lệ đều hiển thị dạng in hoa, không dấu. | Ô input không hề cho tín hiệu nào rằng chuỗi này sai khuôn dạng, trong khi mọi mã hợp lệ đều theo một khuôn rất rõ. | Med | Hiện trạng thái lỗi ngay trên viền ô input (viền đỏ) khi chuỗi không khớp `^[A-Z0-9]{3,20}$`, không đợi đến lúc bấm Áp dụng. |

### Accessibility

| # | Vị trí | Mô tả | Lý do | Mức độ | Đề xuất sửa |
|:---|:---|:---|:---|:---:|:---|
| AC-06 | Thông báo lỗi | Nội dung lỗi nhúng nguyên chuỗi người dùng gõ, gồm cả emoji: `Mã giảm giá "SALE🎉@#$" không tồn tại trên hệ thống.` | Trình đọc màn hình sẽ đọc to tên emoji ("party popper"), làm câu thông báo trở nên khó hiểu. | Low | Lọc ký tự không thuộc khuôn dạng trước khi nhúng vào thông báo, hoặc không nhúng lại chuỗi gốc. |

### UX Problem

| # | Vị trí | Mô tả | Lý do | Mức độ | Đề xuất sửa |
|:---|:---|:---|:---|:---:|:---|
| UX-05 | Thông báo lỗi | Báo **"không tồn tại trên hệ thống"** cho một chuỗi sai khuôn dạng ngay từ đầu. | Hai lỗi khác hẳn nhau bị gộp làm một. Người dùng hiểu thành "mã này đúng kiểu nhưng đã hết" và sẽ đi hỏi lại mã, thay vì sửa ký tự gõ nhầm. | High | Tách hai thông điệp: sai khuôn dạng → *"Mã chỉ gồm chữ in hoa và số, dài 3–20 ký tự."*; đúng khuôn dạng mà không có → *"Mã không tồn tại."* |

> ⚠️ **Đối chiếu ngoài phạm vi ảnh**: `knowledge/features/function-d-voucher.md` ghi MR-01 đã được
> chốt `Confirmed` với quyết định **"Chặn ký tự lạ"** kèm thông báo *"Mã không đúng định dạng"*.
> Ảnh cho thấy hệ thống **không** làm vậy. Đây là chênh lệch giữa luật đã chốt và giao diện thật,
> vượt khỏi thẩm quyền của skill này — chuyển cho `qa-analyst` và `qa-reporter` xử lý.

---

## Tổng hợp

| Nhóm | High | Med | Low | Tổng |
|---|:---:|:---:|:---:|:---:|
| UI Inconsistency | 1 | 3 | 1 | 5 |
| Accessibility | 0 | 3 | 2 | 5 |
| UX Problem | 2 | 1 | 1 | 4 |
| **Tổng** | **3** | **7** | **4** | **14** |

**Ba vấn đề mức High, theo thứ tự nên sửa:**

1. **UX-05** — thông báo lỗi sai bản chất (nói "không tồn tại" cho chuỗi sai khuôn dạng). Đẩy người dùng đi sai hướng khắc phục, lại trái với luật MR-01 đã chốt.
2. **UX-02** — mời bấm nhanh một mã đã hết hạn. Hệ thống tự tạo ra thất bại cho người dùng.
3. **UI-01** — hai con số giỏ hàng mâu thuẫn trên cùng một màn (nav ghi 3, thẻ ghi "1 sản phẩm").

> **Ghi chú độ tin cậy**: các mục gắn `[GIẢ ĐỊNH]` — AC-01, AC-02, AC-03, AC-04 — là nhận định
> về tỉ lệ tương phản, thuộc tính `aria-label` và kích thước đích chạm. Ảnh tĩnh không đo được
> những thứ này. Cần cross-check bằng công cụ (trình kiểm tra tương phản, DevTools) hoặc bằng mắt
> trên thiết bị thật trước khi đưa vào bug report.
