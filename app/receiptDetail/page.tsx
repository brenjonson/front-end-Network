import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Alert } from '@/components/ui/alert';
import { fetchReceipt, fetchCategories, updateReceiptCategory } from '@/services/api';

export default function ReceiptDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [receipt, setReceipt] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        const receiptData = await fetchReceipt(id);
        const categoriesData = await fetchCategories();
        
        setReceipt(receiptData);
        setCategories(categoriesData);
        setSelectedCategory(receiptData.category_id?.toString() || '');
      } catch (err) {
        setError('ไม่สามารถโหลดข้อมูลได้');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleCategoryChange = async () => {
    try {
      await updateReceiptCategory(id, selectedCategory);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      
      // อัปเดตข้อมูลใบเสร็จในหน้านี้
      setReceipt({...receipt, category_id: parseInt(selectedCategory)});
    } catch (err) {
      setError('ไม่สามารถอัปเดตหมวดหมู่ได้');
      console.error(err);
    }
  };

  if (isLoading) return <div>กำลังโหลดข้อมูล...</div>;
  if (error) return <Alert type="error">{error}</Alert>;
  if (!receipt) return <Alert type="warning">ไม่พบข้อมูลใบเสร็จ</Alert>;

  const categoryName = categories.find(c => c.id === receipt.category_id)?.name || 'ไม่ระบุ';

  return (
    <div className="container mx-auto p-4">
      <Button onClick={() => router.back()} className="mb-4">
        &larr; กลับ
      </Button>
      
      {updateSuccess && (
        <Alert type="success" className="mb-4">
          อัปเดตหมวดหมู่เรียบร้อยแล้ว
        </Alert>
      )}
      
      <h1 className="text-2xl font-bold mb-6">
        รายละเอียดใบเสร็จ: {receipt.vendor_name}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ข้อมูลทั่วไป */}
        <Card className="p-4 col-span-2">
          <h2 className="text-xl font-bold mb-4">ข้อมูลทั่วไป</h2>
          
          <div className="mb-4">
            <h3 className="font-medium">ผู้ให้บริการ</h3>
            <p className="text-lg">{receipt.vendor_name}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium">จำนวนเงิน</h3>
            <p className="text-2xl text-green-600">
              {receipt.amount.toLocaleString()} {receipt.currency}
            </p>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium">วันที่</h3>
            <p>{new Date(receipt.receipt_date).toLocaleDateString('th-TH')}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium">หมวดหมู่</h3>
            <div className="flex items-center gap-4">
              <p>{categoryName}</p>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">ไม่ระบุ</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </Select>
                <Button 
                  onClick={handleCategoryChange}
                  disabled={selectedCategory === (receipt.category_id?.toString() || '')}
                >
                  บันทึก
                </Button>
              </div>
            </div>
          </div>
          
          {receipt.receipt_file_path && (
            <div className="mb-4">
              <h3 className="font-medium">ไฟล์ใบเสร็จ</h3>
              <a 
                href={`/api/receipts/${receipt.id}/file`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                ดาวน์โหลดไฟล์ใบเสร็จ
              </a>
            </div>
          )}
        </Card>
        
        {/* ข้อมูลอีเมล */}
        <Card className="p-4">
          <h2 className="text-xl font-bold mb-4">ข้อมูลอีเมล</h2>
          
          <div className="mb-4">
            <h3 className="font-medium">หัวข้อ</h3>
            <p>{receipt.email_subject}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium">จาก</h3>
            <p>{receipt.email_from}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium">วันที่อีเมล</h3>
            <p>{new Date(receipt.email_date).toLocaleDateString('th-TH')}</p>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium">ID อีเมล</h3>
            <p className="text-sm text-gray-500">{receipt.email_id}</p>
          </div>
        </Card>
      </div>
    </div>
  );
}