"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { Search, Filter, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { fetchReceipts,fetchCategories } from '../api/services/route';
import { Receipt,Category } from '../api/services/route';

export default function ReceiptsList() {
  const router = useRouter();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ตัวกรอง
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    dateFrom: null as Date | null,
    dateTo: null as Date | null,
  });

  // การแบ่งหน้า
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const receiptsData = await fetchReceipts();
        const categoriesData = await fetchCategories();
        
        setReceipts(receiptsData);
        setCategories(categoriesData);
        
        // คำนวณจำนวนหน้าทั้งหมด
        setTotalPages(Math.ceil(receiptsData.length / itemsPerPage));
      } catch (err) {
        console.error('Error fetching receipts:', err);
        setError('ไม่สามารถโหลดข้อมูลได้ โปรดลองใหม่อีกครั้ง');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // กรองข้อมูล
  const filteredReceipts = receipts.filter(receipt => {
    const matchSearch = filters.search === '' || 
      receipt.vendor_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
      receipt.email_subject?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchCategory = filters.category === '' || 
      receipt.category_id?.toString() === filters.category;
    
    const receiptDate = new Date(receipt.receipt_date || '');
    
    const matchDateFrom = !filters.dateFrom || 
      new Date(receiptDate) >= new Date(filters.dateFrom);
    
    const matchDateTo = !filters.dateTo || 
      new Date(receiptDate) <= new Date(filters.dateTo);
    
    return matchSearch && matchCategory && matchDateFrom && matchDateTo;
  });

  // เรียงข้อมูลตามวันที่ จากใหม่ไปเก่า
  const sortedReceipts = [...filteredReceipts].sort((a, b) => {
    return new Date(b.receipt_date || '').getTime() - new Date(a.receipt_date || '').getTime();
  });

  // ดึงข้อมูลสำหรับหน้าปัจจุบัน
  const paginatedReceipts = sortedReceipts.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // หากกรองข้อมูลแล้วไม่เหลือข้อมูลในหน้าปัจจุบัน ให้กลับไปหน้าแรก
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredReceipts.length / itemsPerPage));
    if (page > maxPage) {
      setPage(1);
    }
    setTotalPages(maxPage);
  }, [filteredReceipts.length, page]);

  const handleViewReceipt = (id: number) => {
    router.push(`/receiptDetail?id=${id}`);
  };

  // แสดง category ตาม id
  const getCategoryName = (id: number | null | undefined): string => {
    if (!id) return 'ไม่ระบุ';
    const category = categories.find(cat => cat.id === id);
    return category ? category.name : 'ไม่ระบุ';
  };

  // รีเซ็ตตัวกรอง
  const resetFilters = () => {
    setFilters({
      search: '',
      category: '',
      dateFrom: null,
      dateTo: null,
    });
    setPage(1);
  };

  // ฟอร์แมตวันที่
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: th });
    } catch (error) {
      return '-';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive rounded-md">
        <p>{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline" 
          className="mt-2"
        >
          ลองใหม่
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">รายการใบเสร็จทั้งหมด</h1>
        
        <Button variant="outline" onClick={resetFilters}>
          รีเซ็ตตัวกรอง
        </Button>
      </div>

      {/* ตัวกรอง */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">ค้นหา</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ชื่อผู้ให้บริการ หรือชื่อเรื่อง"
                className="pl-8"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">หมวดหมู่</label>
            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="ทุกหมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">ทุกหมวดหมู่</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">ตั้งแต่วันที่</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateFrom ? (
                    format(filters.dateFrom, "PPP", { locale: th })
                  ) : (
                    <span>เลือกวันที่</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateFrom}
                  onSelect={(date) => setFilters({ ...filters, dateFrom: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">ถึงวันที่</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateTo ? (
                    format(filters.dateTo, "PPP", { locale: th })
                  ) : (
                    <span>เลือกวันที่</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.dateTo}
                  onSelect={(date) => setFilters({ ...filters, dateTo: date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </Card>

      {/* ตารางข้อมูล */}
      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันที่</TableHead>
                <TableHead>ผู้ให้บริการ</TableHead>
                <TableHead>จำนวนเงิน</TableHead>
                <TableHead>หมวดหมู่</TableHead>
                <TableHead className="text-right">จัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReceipts.length > 0 ? (
                paginatedReceipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>
                      {formatDate(receipt.receipt_date)}
                    </TableCell>
                    <TableCell>
                      {receipt.vendor_name || 'ไม่ระบุ'}
                    </TableCell>
                    <TableCell>
                      {receipt.amount.toLocaleString()} {receipt.currency}
                    </TableCell>
                    <TableCell>
                      {getCategoryName(receipt.category_id)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewReceipt(receipt.id)}
                      >
                        ดูรายละเอียด
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    ไม่พบรายการใบเสร็จ
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              แสดง {((page - 1) * itemsPerPage) + 1}-{Math.min(page * itemsPerPage, filteredReceipts.length)} จาก {filteredReceipts.length} รายการ
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">หน้าก่อนหน้า</span>
              </Button>
              <div className="text-sm">
                หน้า {page} จาก {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">หน้าถัดไป</span>
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}