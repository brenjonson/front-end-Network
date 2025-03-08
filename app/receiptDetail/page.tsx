"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { ChevronLeft, FileText, Mail, Building, Calendar, Tag, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchReceipt, fetchCategories, updateReceiptCategory } from '../api/services/route';
import { Receipt, Category } from '../api/services/route';

export default function ReceiptDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const receiptId = searchParams.get('id');
  
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!receiptId) {
        setError('รหัสใบเสร็จไม่ถูกต้อง');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const id = parseInt(receiptId);
        
        // ดึงข้อมูลใบเสร็จ
        const receiptData = await fetchReceipt(id);
        
        // ดึงข้อมูลหมวดหมู่
        const categoriesData = await fetchCategories();
        
        setReceipt(receiptData);
        setCategories(categoriesData);
        setSelectedCategory(receiptData.category_id?.toString() || '');
      } catch (err) {
        console.error('Error fetching receipt data:', err);
        setError('ไม่สามารถโหลดข้อมูลได้ โปรดลองใหม่อีกครั้ง');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [receiptId]);

  const handleCategoryChange = async () => {
    if (!receipt || !receiptId) return;

    try {
      setIsUpdating(true);
      const id = parseInt(receiptId);
      const categoryId = selectedCategory ? parseInt(selectedCategory) : 0;
      
      await updateReceiptCategory(id, categoryId);
      
      // อัปเดตข้อมูลใบเสร็จในหน้านี้
      setReceipt({
        ...receipt,
        category_id: categoryId || null
      });
      
      setUpdateSuccess(true);
      
      // ซ่อนข้อความแจ้งเตือนหลังจาก 3 วินาที
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error updating category:', err);
      setError('ไม่สามารถอัปเดตหมวดหมู่ได้');
    } finally {
      setIsUpdating(false);
    }
  };

  // แปลงวันที่ให้อยู่ในรูปแบบที่อ่านง่าย
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: th });
    } catch (error) {
      return '-';
    }
  };

  // แสดง category name
  const getCategoryName = (id: number | null | undefined): string => {
    if (!id) return 'ไม่ระบุ';
    const category = categories.find(cat => cat.id === id);
    return category ? category.name : 'ไม่ระบุ';
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
      <div className="space-y-4">
        <Button onClick={() => router.back()} variant="outline">
          <ChevronLeft className="mr-2 h-4 w-4" />
          กลับ
        </Button>
        
        <Alert>
          <p>{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-2"
          >
            ลองใหม่
          </Button>
        </Alert>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="space-y-4">
        <Button onClick={() => router.back()} variant="outline">
          <ChevronLeft className="mr-2 h-4 w-4" />
          กลับ
        </Button>
        
        <Alert>
          <p>ไม่พบข้อมูลใบเสร็จ</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={() => router.back()} variant="outline">
          <ChevronLeft className="mr-2 h-4 w-4" />
          กลับ
        </Button>
      </div>
      
      {updateSuccess && (
        <Alert>
          <Check className="h-4 w-4 mr-2" />
          อัปเดตหมวดหมู่เรียบร้อยแล้ว
        </Alert>
      )}
      
      <h1 className="text-2xl font-bold">
        รายละเอียดใบเสร็จ: {receipt.vendor_name || 'ไม่ระบุชื่อผู้ให้บริการ'}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ข้อมูลทั่วไป */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">ข้อมูลทั่วไป</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center text-muted-foreground mb-1">
                <Building className="mr-2 h-4 w-4" />
                <span className="text-sm">ผู้ให้บริการ</span>
              </div>
              <p className="text-lg">{receipt.vendor_name || 'ไม่ระบุ'}</p>
            </div>
            
            <div>
              <div className="flex items-center text-muted-foreground mb-1">
                <Calendar className="mr-2 h-4 w-4" />
                <span className="text-sm">วันที่</span>
              </div>
              <p>{formatDate(receipt.receipt_date)}</p>
            </div>
            
            <div>
              <div className="flex items-center text-muted-foreground mb-1">
                <Tag className="mr-2 h-4 w-4" />
                <span className="text-sm">หมวดหมู่</span>
              </div>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <p>{getCategoryName(receipt.category_id)}</p>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="เลือกหมวดหมู่" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">ไม่ระบุ</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={handleCategoryChange}
                    disabled={isUpdating || selectedCategory === (receipt.category_id?.toString() || '')}
                  >
                    {isUpdating ? 'กำลังบันทึก...' : 'บันทึก'}
                  </Button>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center text-muted-foreground mb-1">
                <span className="text-sm">จำนวนเงิน</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {receipt.amount.toLocaleString()} {receipt.currency}
              </p>
            </div>
            
            {receipt.receipt_number && (
              <div>
                <div className="flex items-center text-muted-foreground mb-1">
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="text-sm">เลขที่ใบเสร็จ</span>
                </div>
                <p>{receipt.receipt_number}</p>
              </div>
            )}
            
            {receipt.payment_method && (
              <div>
                <div className="flex items-center text-muted-foreground mb-1">
                  <span className="text-sm">วิธีชำระเงิน</span>
                </div>
                <p>{receipt.payment_method}</p>
              </div>
            )}
            
            {receipt.notes && (
              <div>
                <div className="flex items-center text-muted-foreground mb-1">
                  <span className="text-sm">หมายเหตุ</span>
                </div>
                <p>{receipt.notes}</p>
              </div>
            )}
            
            {receipt.receipt_file_path && (
              <div>
                <div className="flex items-center text-muted-foreground mb-1">
                  <FileText className="mr-2 h-4 w-4" />
                  <span className="text-sm">ไฟล์ใบเสร็จ</span>
                </div>
                <a 
                  href={`/api/v1/receipts/${receipt.id}/file`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  ดาวน์โหลดไฟล์ใบเสร็จ
                </a>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* ข้อมูลอีเมล */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ข้อมูลอีเมล</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {receipt.email_subject && (
              <div>
                <div className="flex items-center text-muted-foreground mb-1">
                  <Mail className="mr-2 h-4 w-4" />
                  <span className="text-sm">หัวข้อ</span>
                </div>
                <p className="break-words">{receipt.email_subject}</p>
              </div>
            )}
            
            {receipt.email_from && (
              <div>
                <div className="flex items-center text-muted-foreground mb-1">
                  <span className="text-sm">จาก</span>
                </div>
                <p className="break-words">{receipt.email_from}</p>
              </div>
            )}
            
            {receipt.email_date && (
              <div>
                <div className="flex items-center text-muted-foreground mb-1">
                  <span className="text-sm">วันที่อีเมล</span>
                </div>
                <p>{formatDate(receipt.email_date)}</p>
              </div>
            )}
            
            {receipt.email_id && (
              <div>
                <div className="flex items-center text-muted-foreground mb-1">
                  <span className="text-sm">ID อีเมล</span>
                </div>
                <p className="text-xs text-muted-foreground break-all">{receipt.email_id}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}