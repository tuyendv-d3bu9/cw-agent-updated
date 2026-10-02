# Thuật Ngữ Nghiệp Vụ Toàn Hệ Thống (_glossary.md)

> File này định nghĩa chính xác các thuật ngữ nghiệp vụ xuyên suốt mọi tính năng của dự án.
> Giúp Agent, Tester, BA và Developer hiểu cùng một nghĩa, tránh nhầm lẫn logic khi phân tích.

Dự án: `<Tên Dự Án>` · Cập nhật: `<YYYY-MM-DD>`

---

## 1. Người Dùng & Phân Quyền (Users & Roles)

| Thuật ngữ | Tiếng Anh tương đương | Định nghĩa chính xác | Ranh giới / Lưu ý |
|---|---|---|---|
| **Người dùng vãng lai** | Guest User | Người dùng truy cập hệ thống chưa đăng nhập / định danh. | Chỉ được xem thông tin công khai; bị chặn ở các luồng cần xác thực. |
| **Người dùng định danh** | Registered User | Tài khoản đã đăng ký và xác thực danh tính trong hệ thống. | Có hồ sơ, quyền hạn và lịch sử hoạt động riêng biệt. |
| **Tài khoản Hoạt động** | Active Account | Tài khoản đang ở trạng thái hoạt động bình thường. | Đủ điều kiện thực hiện các giao dịch và thao tác nghiệp vụ. |
| **Tài khoản Khóa / Treo** | Locked / Suspended | Tài khoản bị tạm khóa hoặc cấm do vi phạm chính sách / bảo mật. | Bị chặn truy cập các tính năng nghiệp vụ; hiển thị thông báo lỗi phù hợp. |

---

## 2. Thực Thể Nghiệp Vụ Cốt Lõi (Core Domain Entities)

| Thuật ngữ | Tiếng Anh tương đương | Định nghĩa chính xác | Ranh giới / Lưu ý |
|---|---|---|---|
| _[Thực thể 1]_ | _[Entity 1]_ | _[Định nghĩa ý nghĩa nghiệp vụ của thực thể trong hệ thống]_ | _[Các ràng buộc biên hoặc lưu ý đặc biệt]_ |
| _[Thực thể 2]_ | _[Entity 2]_ | _[Định nghĩa ý nghĩa nghiệp vụ của thực thể trong hệ thống]_ | _[Các ràng buộc biên hoặc lưu ý đặc biệt]_ |

---

## 3. Trạng Thái Vòng Đời (Lifecycle States)

| Trạng thái | Ý nghĩa | Hành vi hệ thống |
|---|---|---|
| **Draft / Nháp** | Dữ liệu đang được khởi tạo, chưa ban hành hoặc chưa kích hoạt. | Chưa có hiệu lực với người dùng cuối; chỉ xem được ở màn quản trị. |
| **Active / Hiệu lực** | Đang trong thời gian hiệu lực và sẵn sàng sử dụng. | Cho phép tương tác và thực hiện nghiệp vụ bình thường. |
| **Expired / Hết hạn** | Đã vượt quá thời gian hiệu lực quy định. | Báo lỗi hoặc chặn thao tác khi người dùng cố gắng tương tác. |
| **Cancelled / Đã hủy** | Bị hủy bỏ bởi người dùng hoặc hệ thống. | Không thể khôi phục lại trạng thái trước đó. |

---

## 4. Tham Số & Công Thức Tính Toán (Parameters & Calculations)

| Thuật ngữ | Tiếng Anh tương đương | Định nghĩa & Công thức | Đơn vị / Định dạng |
|---|---|---|---|
| _[Tham số 1]_ | _[Parameter 1]_ | _[Mô tả cách tính toán hoặc công thức logic]_ | _[VNĐ / % / Số nguyên]_ |
