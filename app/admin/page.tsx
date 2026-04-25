
'use client';

import { useState } from 'react';

export default function Admin() {
  const [title, setTitle] = useState('');

  async function submit() {
    await fetch('/api/content', {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
    alert('تم الإرسال');
  }

  return (
    <div>
      <h1>لوحة التحكم</h1>
      <input onChange={e=>setTitle(e.target.value)} placeholder="عنوان"/>
      <button onClick={submit}>إضافة</button>
    </div>
  );
}
