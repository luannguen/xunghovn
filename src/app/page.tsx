import DesktopLayout from "@/components/desktop/DesktopLayout";
import MobileLayout from "@/components/mobile/MobileLayout";

export default function Home() {
  return (
    <>
      {/* Hiển thị trên màn hình lớn (Desktop) */}
      <div className="hidden md:block h-full w-full">
        <DesktopLayout />
      </div>

      {/* Hiển thị trên màn hình nhỏ (Mobile) */}
      <div className="block md:hidden h-full w-full">
        <MobileLayout />
      </div>
    </>
  );
}
