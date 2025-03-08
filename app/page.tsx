import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/receipt-icon.svg"
              alt="Receipt Icon"
              width={28}
              height={28}
              className="dark:invert"
            />
            <span className="text-lg font-semibold">Receipt Manager</span>
          </div>
          <div>
            <Link href="/login">
              <Button variant="outline" className="mr-2">เข้าสู่ระบบ</Button>
            </Link>
            <Link href="/register">
              <Button>สมัครสมาชิก</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                จัดการใบเสร็จอัตโนมัติจากอีเมลของคุณ
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Receipt Manager ช่วยคุณแยกแยะและจัดการใบเสร็จที่ส่งเข้ามาทางอีเมล
                ติดตามค่าใช้จ่าย และวิเคราะห์พฤติกรรมการใช้จ่ายของคุณได้อย่างง่ายดาย
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    เริ่มต้นใช้งานฟรี
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    ดูฟีเจอร์ทั้งหมด
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-full max-w-md aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/dashboard-preview.png"
                  alt="Dashboard Preview"
                  fill
                  style={{ objectFit: "cover" }}
                  priority
                />
              </div>
            </div>
          </div>
        </section>
        
        <section id="features" className="bg-muted py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">ฟีเจอร์หลัก</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="mb-4 rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="m6 9 6 6 6-6"/></svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">การนำเข้าอัตโนมัติ</h3>
                <p className="text-muted-foreground">
                  นำเข้าใบเสร็จอัตโนมัติจากอีเมลของคุณผ่านการตั้งค่า IMAP ที่ปลอดภัย
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="mb-4 rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M3 3v18h18"/><path d="m9 9 3.5 3L22 7"/></svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">การวิเคราะห์ค่าใช้จ่าย</h3>
                <p className="text-muted-foreground">
                  วิเคราะห์ค่าใช้จ่ายของคุณด้วยกราฟและแผนภูมิที่เข้าใจง่าย
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg shadow-sm">
                <div className="mb-4 rounded-full bg-primary/10 p-3 w-12 h-12 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">จัดการหมวดหมู่</h3>
                <p className="text-muted-foreground">
                  จัดหมวดหมู่ใบเสร็จตามประเภทค่าใช้จ่ายเพื่อติดตามงบประมาณได้แม่นยำ
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} Receipt Manager. All rights reserved.
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                เงื่อนไขการใช้งาน
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                นโยบายความเป็นส่วนตัว
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                ติดต่อเรา
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}