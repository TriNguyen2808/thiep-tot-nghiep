import { Wish, CollectionItem, ParkingLocation, TimelineMilestone } from '@/types';

export const INITIAL_WISHES: Wish[] = [
  {
    id: 'wish-1',
    name: 'Hoàng Minh (Nhóm Đồ Án 2AM)',
    attendance: 'yes',
    message: 'Chúc mừng người anh em chí cốt Trí Nguyễn chính thức cầm bằng Cử nhân trên tay! Nhớ lại những đêm 2-3h sáng cả bọn cày đồ án, debug muốn nổ não nhưng vẫn chia nhau từng ly mì tôm. Chúc Trí bước sang chặng đường mới luôn rực rỡ, thành công và sớm chạm tới ước mơ nhé! See you at Graduation Day! 🎓✨',
    images: [
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80'
    ],
    isPublic: true,
    likes: 24,
    createdAt: '2026-11-05T14:20:00Z'
  },
  {
    id: 'wish-2',
    name: 'Thảo My',
    attendance: 'yes',
    message: 'Thanh xuân này thật may mắn vì có bạn cùng lớp nhiệt huyết và tốt bụng như Trí. Chúc bạn bay thật cao thật xa, luôn giữ nụ cười tươi rói như ngày khoác áo cử nhân nha! Nhất định mình sẽ có mặt sớm để giành slot chụp ảnh đầu tiên đấy 📸💐',
    images: [
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80'
    ],
    isPublic: true,
    likes: 19,
    createdAt: '2026-11-05T18:45:00Z'
  },
  {
    id: 'wish-3',
    name: 'Một người bạn bí mật 🤫',
    attendance: 'yes',
    message: 'Biết Trí từ những ngày đầu bỡ ngỡ bước chân vào cổng trường đại học, thấy Trí ngày càng trưởng thành, vững vàng và toả sáng. Ngày vui của Trí, chúc Trí tất cả những điều tuyệt vời nhất trần đời! Tự hào về Trí rất nhiều! ❤️',
    images: [],
    isPublic: false,
    likes: 12,
    createdAt: '2026-11-06T09:15:00Z'
  },
  {
    id: 'wish-4',
    name: 'CLB Truyền Thông & Sự Kiện',
    attendance: 'maybe',
    message: 'Cựu Chủ nhiệm câu lạc bộ của chúng em đỉnh chóp quá! Chúc anh Trí tốt nghiệp loại xuất sắc, mở ra tương lai sáng ngời. Cả CLB sẽ cố gắng kéo quân sang cổ vũ anh rực rỡ nhất khán đài! 🌟🎉',
    images: [
      'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80'
    ],
    isPublic: true,
    likes: 31,
    createdAt: '2026-11-06T11:30:00Z'
  }
];

export const TIMELINE_DATA: TimelineMilestone[] = [
  {
    time: '07:30 - 08:30',
    title: 'Đón Tiếp & Check-in Rực Rỡ',
    description: 'Khoác lên mình bộ lễ phục cử nhân, nhận hoa chúc mừng và chụp những bức ảnh check-in đầu tiên bên backdrop Y2K.',
    location: 'Sảnh chính A1 - Khu vực Backdrop kỷ niệm',
    iconName: 'Sparkles',
    highlight: false
  },
  {
    time: '08:30 - 09:30',
    title: 'Khoảnh Khắc Kỷ Niệm Cùng Bạn Bè & Người Thân',
    description: 'Thời gian vàng để tụ họp gia đình, bạn bè thân thiết, chụp photobooth và ký tên vào lưu bút kỷ niệm.',
    location: 'Sân trung tâm & Khuôn viên trường',
    iconName: 'Camera',
    highlight: false
  },
  {
    time: '09:30 - 11:00',
    title: 'Lễ Trao Bằng Tốt Nghiệp Chính Thức',
    description: 'Giây phút thiêng liêng nhất thời sinh viên: bước lên bục vinh quang, nhận tấm bằng Cử nhân sau những năm tháng thanh xuân nỗ lực.',
    location: 'Hội trường lớn A1 (Tầng 2)',
    iconName: 'GraduationCap',
    highlight: true
  },
  {
    time: '11:00 - 11:30',
    title: 'Nghi Thức Tung Nón Cử Nhân',
    description: 'Cùng toàn thể tân cử nhân ném nón lên bầu trời cao xanh, khép lại trang sinh viên và mở ra chân trời mới!',
    location: 'Bậc thềm Hội trường trung tâm',
    iconName: 'PartyPopper',
    highlight: true
  },
  {
    time: '11:30 - 13:00',
    title: 'Tiệc Ngọt & Cà Phê Chuyện Trò Cùng Trí',
    description: 'Một bữa tiệc nhẹ ấm cúng, thưởng thức bánh trà, nghe nhạc hoài niệm và cùng nhau ôn lại những kỷ niệm đẹp nhất.',
    location: 'The Coffee Lounge - Gần Cổng 2',
    iconName: 'Coffee',
    highlight: false
  }
];

export const PARKING_LOCATIONS: ParkingLocation[] = [
  {
    id: 'park-1',
    name: 'Bãi Xe Cổng Chính (Cổng 1)',
    vehicleType: 'Xe máy & Ô tô (Có bảo vệ)',
    address: 'Cổng 1, Mặt tiền đường chính trường Đại học',
    description: 'Bãi giữ xe rộng rãi ngay lối vào chính, thuận tiện đi thẳng vào sảnh check-in Hội trường A1 trong vòng 2 phút đi bộ.',
    fee: 'Xe máy: 5.000đ/lượt | Ô tô: 30.000đ/lượt',
    tips: 'Nên đến trước 08:00 để chọn được vị trí đỗ xe râm mát gần lối đi chính.',
    mapUrl: 'https://maps.google.com/?q=Dai+Hoc+Bach+Khoa+Ho+Chi+Minh'
  },
  {
    id: 'park-2',
    name: 'Hầm Giữ Xe Tòa Nhà Trung Tâm (Hầm B1 & B2)',
    vehicleType: 'Xe máy & Ô tô (Tầng hầm có thang máy)',
    address: 'Lối xuống hầm bên hông phải Tòa nhà Hội trường lớn',
    description: 'Khu vực hầm xe hiện đại có mái che 100%, bảo vệ trông giữ 24/7, có thang máy di chuyển trực tiếp lên tầng 1 và tầng 2 sảnh lễ tốt nghiệp.',
    fee: 'Xe máy: 6.000đ/lượt | Ô tô: 35.000đ/lượt',
    tips: 'Rất thích hợp cho khách đi giày cao gót hoặc mang theo trang phục lễ phục trang trọng.',
    mapUrl: 'https://maps.google.com/?q=Dai+Hoc+Bach+Khoa+Ho+Chi+Minh'
  },
  {
    id: 'park-3',
    name: 'Bãi Giữ Xe Cổng Phụ (Cổng 2 - Đường sau)',
    vehicleType: 'Xe máy (Thông thoáng, không lo kẹt)',
    address: 'Cổng 2, Đường nội bộ khu ký túc xá & căng tin',
    description: 'Bãi phụ thoáng đãng, lối ra vào rộng rãi giúp tránh tình trạng ùn tắc vào giờ cao điểm sau khi buổi lễ kết thúc.',
    fee: 'Xe máy: 5.000đ/lượt',
    tips: 'Lối này rất gần quán cà phê và khu vực sân cây xanh mát chụp ảnh kỷ yếu.',
    mapUrl: 'https://maps.google.com/?q=Dai+Hoc+Bach+Khoa+Ho+Chi+Minh'
  }
];

export const PHOTO_COLLECTIONS: CollectionItem[] = [
  {
    id: 'col-1',
    title: 'Những Ngày Đầu Bước Chân Vào Giảng Đường',
    coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    description: 'Những ngày bỡ ngỡ làm quen lớp mới, những giảng đường bậc thang ngập tràn nắng sớm và những nụ cười ngây ngô thuở tân sinh viên.',
    badge: 'Tân Sinh Viên • 2022',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
        caption: 'Tiết học đầu tiên tại giảng đường lớn với những người bạn mới'
      },
      {
        url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=80',
        caption: 'Góc sân trường rợp bóng cây cổ thụ nơi tụ họp mỗi giờ giải lao'
      },
      {
        url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
        caption: 'Buổi sinh hoạt đầu khóa và những chiếc thẻ sinh viên đầu tiên'
      }
    ]
  },
  {
    id: 'col-2',
    title: 'Đồ Án, Deadline & Những Đêm Trắng 2AM',
    coverImage: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=800&q=80',
    description: 'Khoảng thời gian cày cuốc đồ án chuyên ngành, cùng đồng đội thức trắng đêm gõ code, sửa slide và những ly cà phê sữa đá đậm đà.',
    badge: 'Kỷ Niệm Cày Cuốc • 2AM Club',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80',
        caption: 'Bàn làm việc quen thuộc tại thư viện trường lúc nửa đêm'
      },
      {
        url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
        caption: 'Cùng nhóm bạn tranh luận hăng say cho bài thuyết trình kết thúc môn'
      },
      {
        url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
        caption: 'Dòng code cuối cùng được commit trước deadline 23:59:59'
      }
    ]
  },
  {
    id: 'col-3',
    title: 'Chiến Dịch Mùa Hè Xanh & Chuyến Đi Thanh Xuân',
    coverImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
    description: 'Màu áo xanh tình nguyện in dấu trên những nẻo đường quê hương, những buổi lửa trại bập bùng và tiếng đàn guitar dưới bầu trời sao.',
    badge: 'Áo Xanh Tình Nguyện • Thanh Xuân',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
        caption: 'Hội bạn thân trong chuyến đi tình nguyện hè về vùng quê xa'
      },
      {
        url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
        caption: 'Chuyến phượt xuyên rừng cùng những người bạn đại học'
      },
      {
        url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80',
        caption: 'Đêm lửa trại ấm áp với tiếng hát và những lời tâm sự chân thành'
      }
    ]
  },
  {
    id: 'col-4',
    title: 'Khoảnh Khắc Kỷ Yếu & Hội Bạn Tri Kỷ',
    coverImage: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80',
    description: 'Những thước phim kỷ yếu ghi lại tuổi 22 rực rỡ nhất: áo cử nhân, hoa hướng dương tươi thắm và những nụ cười không bao giờ phai.',
    badge: 'Kỷ Yếu • Class of 2026',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80',
        caption: 'Khoảnh khắc rực rỡ cùng bó hoa hướng dương trong ngày chụp kỷ yếu'
      },
      {
        url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=1200&q=80',
        caption: 'Ánh nắng hoàng hôn buông xuống sân trường thân thương'
      },
      {
        url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
        caption: 'Tập thể lớp với niềm tự hào sau 4 năm đồng hành bền chặt'
      }
    ]
  }
];

export const GRADUATE_INFO = {
  fullName: 'Trí Nguyễn',
  title: 'Tân Cử Nhân',
  major: 'Công Nghệ Thông Tin & Khoa Học Máy Tính',
  university: 'Trường Đại Học Bách Khoa TP.HCM',
  date: 'Thứ Bảy, Ngày 15 Tháng 11 Năm 2026',
  time: '08:00 Sáng - 12:30 Trưa',
  venue: 'Hội Trường Lớn A1 - Tòa Nhà Trung Tâm',
  address: '268 Lý Thường Kiệt, Phường 14, Quận 10, TP. Hồ Chí Minh',
  phone: '0901 234 567',
  zalo: 'https://zalo.me/0901234567',
  facebook: 'https://facebook.com/tringuyen.grad',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  portraitImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
  gownImage: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=800&q=80'
};

