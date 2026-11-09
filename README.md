# 🎓 THIỆP MỜI LỄ TỐT NGHIỆP • TRÍ NGUYỄN (GRADUATION 2026)

Trang web thiệp mời tốt nghiệp hiện đại, mang đậm bản sắc truyền thống Việt Nam phối hợp thẩm mỹ học đường Y2K tươi sáng, đầy ắp kỷ niệm.

---

## 🌟 TÍNH NĂNG NỔI BẬT

1. **Mở đầu chiếc Radio Y2K độc đáo**:
   - Chiếc đài radio cổ điển rung lắc sống động kèm âm thanh rè rè tuning đài chân thực.
   - Tự động đếm ngược 3 giây hoặc click nút để mở thiệp mời, bung pháo hoa confetti rực rỡ.
   - Có nút phát lại radio ở chân trang bất cứ lúc nào.

2. **Cá nhân hóa tên khách mời qua đường link (URL query)**:
   - Dễ dàng tạo link gửi riêng cho từng người bạn:
     - `https://your-domain.vercel.app?to=Minh_Anh`
     - `https://your-domain.vercel.app?to=Nguyễn_Văn_A`
     - `https://your-domain.vercel.app?to=Hội_Bạn_Thân_Cấp_3`
   - Tên khách mời sẽ tự động xuất hiện trang trọng trong phần **"Thân mời [tên khách mời]..."**.

3. **Thư bí mật (Secret Letter) dành riêng cho người đặc biệt**:
   - Nút bấm trang trọng mở phong bì thư 3D với âm thanh mở giấy sột soạt.
   - Chứa thời gian viết thư tâm sự, lời cảm ơn sâu lắng, 2 khung ảnh kỷ niệm và nút gấp thư lại.
   - Tự động mở thư bí mật qua link: `?to=Minh_Anh&secret=1`.

4. **Screen Timeline & Thông tin sự kiện**:
   - Cột mốc thời gian rõ ràng: Lễ phục, chụp ảnh gia đình, lễ trao bằng, tung nón cử nhân, tiệc ngọt.
   - Địa điểm, thông tin liên hệ nhanh qua SĐT/Zalo.
   - **Khu vực hướng dẫn giữ xe chi tiết**: Danh sách 3 bãi xe (Cổng chính, Hầm B1 & B2, Cổng phụ) kèm mô tả, chi phí, kinh nghiệm và **nút bấm mở trực tiếp Google Maps chỉ đường**!

5. **Bộ sưu tập khoảnh khắc đẹp tại trường**:
   - Các album chủ đề dạng thẻ Polaroid Y2K.
   - Bấm vào mở Modal Lightbox xem full bộ ảnh, lướt ảnh mượt mà, xem caption chi tiết.

6. **Lưu bút & Gửi lời chúc (Guestbook)**:
   - Form bên trái: Nhập tên, xác nhận tham gia (3 trạng thái), lời chúc, tải lên 1 hoặc nhiều ảnh kỷ niệm, checkbox *"Bạn có muốn những khách mời khác biết bạn là ai không?"* (mặc định tick có).
   - Popup modal xác nhận trước khi gửi lời chúc (người dùng đồng ý mới gửi).
   - Feed bên phải: Hiển thị các lời chúc dưới dạng **bài đăng Instagram Y2K** (Avatar gradient, huy hiệu tham gia, carousel ảnh kỷ niệm với dots/arrows, nút thả tim đếm số like, hashtag học đường).

7. **Âm thanh tích hợp hoàn hảo**:
   - Tiếng radio rè rè tuning dial khi mở đầu.
   - Tiếng mở phong bì thư giấy lụa sột soạt.
   - Nhạc nền: bài hát **"Giữ anh cho ngày hôm qua"** (Vũ Cát Tường).
   - Floating music player hình đĩa than xoay tròn Y2K ở góc màn hình.

---

## 🚀 HƯỚNG DẪN DEPLOY LÊN VERCEL TRONG 2 PHÚT

### Cách 1: Deploy qua GitHub (Khuyên dùng - Nhanh & Tự động cập nhật)

1. Tạo một repository mới trên GitHub (ví dụ: `thiep-tot-nghiep-tri-nguyen`).
2. Mở terminal tại thư mục dự án và chạy các lệnh sau:
   ```bash
   git init
   git add .
   git commit -m "Initial graduation invitation website"
   git branch -M main
   git remote add origin https://github.com/TÊN_GITHUB_CỦA_BẠN/thiep-tot-nghiep-tri-nguyen.git
   git push -u origin main
   ```
3. Truy cập [vercel.com](https://vercel.com) và đăng nhập bằng tài khoản GitHub.
4. Bấm **"Add New..."** ➔ **"Project"**.
5. Chọn repository vừa tạo và nhấn **"Deploy"**. Vercel sẽ tự động build và cung cấp link website trong vòng 1 phút!

### Cách 2: Deploy trực tiếp bằng Vercel CLI

```bash
npm install -g vercel
vercel
```
Làm theo các bước hướng dẫn trên màn hình và trang web sẽ online ngay lập tức!

---

## 🎨 HƯỚNG DẪN THAY ĐỔI THÔNG TIN VÀ HÌNH ẢNH

Tất cả thông tin được gom gọn gàng trong file:
👉 **`data/initialData.ts`**

- **Thay đổi thông tin cá nhân**: Sửa object `GRADUATE_INFO` (Họ tên, trường lớp, ngày giờ, địa điểm, SĐT, Zalo).
- **Thay đổi ảnh của Trí Nguyễn**: Đặt ảnh của bạn vào thư mục `public/images/` rồi cập nhật đường dẫn trong `GRADUATE_INFO`.
- **Thay đổi ảnh trong Thư bí mật**: Mở `components/SecretLetterModal.tsx` và thay link ảnh ở 2 khung polaroid.
- **Thay đổi bộ sưu tập ảnh trường**: Chỉnh sửa mảng `PHOTO_COLLECTIONS` trong `data/initialData.ts`.
- **Thay đổi nhạc nền**: Bạn có thể thay link nhạc trong `components/MusicPlayer.tsx` hoặc thả file `bgm.mp3` vào `public/audio/`.

