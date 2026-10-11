# PHIẾU HỎI · Đơn hàng không được lưu vào key nào trong `_sut.json`
Owner: qa-system/qa-reporter/gen-bug-report · Nguồn: `runs/RUN-01_voucher-regression/run_result.md` · Verdict: ASK

> **Đây không phải bug report.** Hai ca `VCHR-034` và `VCHR-036` FAIL, nhưng chưa đủ căn cứ
> để khẳng định là lỗi sản phẩm hay là test case bám sai key lưu trữ. Cần Dev trả lời trước.

## Hiện tượng đo được

| Ca | Assertion thất bại |
|---|---|
| `VCHR-034` | `localStorage.getItem('shopgo_orders')` trả về `null` sau khi đặt hàng thành công |
| `VCHR-036` | Đặt hàng ở 2 tab, kỳ vọng ≥ 2 đơn được lưu, đếm được **0** |

## Kiểm chứng trực tiếp

Chạy một lượt dò riêng: đăng nhập, dựng giỏ 350.000 đ, áp mã `GIAM50K`, bấm đặt hàng.
`submitOrder()` trả về `true` (giao diện báo đặt hàng thành công). Ngay sau đó:

```
KEY TRƯỚC KHI ĐẶT: shopgo_user, shopgo_sqlite_queries_log
KEY SAU KHI ĐẶT  : shopgo_user (218 ký tự), shopgo_sqlite_queries_log (953 ký tự)

shopgo_orders            -> NULL
shopgo_sqlite_orders_v1  -> NULL
```

**Cả hai key đơn hàng khai trong `knowledge/_sut.json` đều không tồn tại**, kể cả sau khi
đặt hàng thành công. Chỉ `shopgo_sqlite_queries_log` có thay đổi độ dài.

## Câu hỏi cần Dev trả lời

1. Đơn hàng sau khi đặt được lưu ở đâu? `localStorage`, IndexedDB, hay chỉ nằm trong bộ nhớ và mất khi tải lại trang?
2. Hai key `shopgo_orders` và `shopgo_sqlite_orders_v1` trong `knowledge/_sut.json` còn dùng không, hay đã bị thay thế?
3. Nếu đơn chỉ nằm trong bộ nhớ: đó là thiết kế có chủ đích của bản demo, hay là lỗi?

## Tuỳ câu trả lời thì làm gì tiếp

- **Đơn đúng ra phải được lưu** → đây là lỗi sản phẩm mức **Critical**: người dùng đặt hàng xong, tải lại trang là mất đơn. Mở bug ngay.
- **Đơn cố tình không lưu** → `VCHR-034` và `VCHR-036` sai đề, phải viết lại; đồng thời sửa `knowledge/_sut.json` vì nó đang khai hai key không tồn tại.

## Giả Định
- `[GIẢ ĐỊNH]` Lượt dò chỉ kiểm `localStorage` và không kiểm IndexedDB — probe kiểm IndexedDB bị lỗi locator ở màn Đơn hàng, chưa chạy lại. Nếu Dev trả lời "lưu ở IndexedDB" thì cần dò lại trước khi kết luận.
