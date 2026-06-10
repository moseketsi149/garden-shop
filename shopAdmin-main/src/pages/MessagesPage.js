import { useMemo, useState } from 'react';

const customers = [
  { id: 'cust-1001', name: 'Apex Logistics', email: 'accounts@apexlogistics.com' },
  { id: 'cust-1002', name: 'NorthStar Industries', email: 'billing@northstar.com' },
  { id: 'cust-1003', name: 'Bayfield Enterprises', email: 'orders@bayfield.co' }
];

const messageTemplates = [
  {
    id: 'payment-received',
    label: 'Payment received',
    subject: 'Payment received for your order',
    body: 'We have received your payment and your order has been confirmed. Thank you for your prompt payment.'
  },
  {
    id: 'order-approved',
    label: 'Order approved',
    subject: 'Your order has been approved',
    body: 'Your order is now approved and is being prepared for fulfillment. Expect dispatch details shortly.'
  },
  {
    id: 'contract-expiring',
    label: 'Contract expiring soon',
    subject: 'Contract expiry reminder',
    body: 'Your contract is expiring soon. Please review your terms and renew before the deadline to avoid service interruption.'
  },
  {
    id: 'custom',
    label: 'Custom message',
    subject: '',
    body: ''
  }
];

export default function MessagesPage() {
  const [recipientId, setRecipientId] = useState(customers[0].id);
  const [templateId, setTemplateId] = useState(messageTemplates[0].id);
  const [subject, setSubject] = useState(messageTemplates[0].subject);
  const [body, setBody] = useState(messageTemplates[0].body);
  const [sentMessages, setSentMessages] = useState([]);
  const [success, setSuccess] = useState('');

  const selectedCustomer = useMemo(() => customers.find((customer) => customer.id === recipientId), [recipientId]);
  const selectedTemplate = useMemo(
    () => messageTemplates.find((template) => template.id === templateId),
    [templateId]
  );

  const handleTemplateChange = (value) => {
    setTemplateId(value);
    const template = messageTemplates.find((templateItem) => templateItem.id === value);
    setSubject(template.subject);
    setBody(template.body);
  };

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) {
      setSuccess('Please enter a subject and message body.');
      return;
    }

    const message = {
      id: `msg-${Date.now()}`,
      recipient: selectedCustomer.name,
      email: selectedCustomer.email,
      subject,
      body,
      sentAt: new Date().toLocaleString()
    };

    setSentMessages((current) => [message, ...current]);
    setSuccess(`Message sent to ${selectedCustomer.name}.`);
  };

  return (
    <section className="space-y-8">
      <div className="rounded-[2rem] bg-white p-8 shadow-card">
        <h1 className="text-3xl font-semibold text-slate-900">Customer Messaging</h1>
        <p className="mt-2 text-slate-600">Send messages to customers for payments, order approvals, contracts, and custom notifications.</p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm text-slate-600">Customer</span>
                <select
                  value={recipientId}
                  onChange={(event) => setRecipientId(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                >
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} — {customer.email}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm text-slate-600">Template</span>
                <select
                  value={templateId}
                  onChange={(event) => handleTemplateChange(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                >
                  {messageTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm text-slate-600">Subject</span>
              <input
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                placeholder="Message subject"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-600">Message body</span>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                rows={8}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
                placeholder="Write a custom message for the customer."
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500">You can personalize the body after selecting a template.</p>
              </div>
              <button
                type="button"
                onClick={handleSend}
                className="inline-flex items-center justify-center rounded-3xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Send message
              </button>
            </div>

            {success && (
              <div className="rounded-3xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700">
                {success}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-8 shadow-card">
          <h2 className="text-2xl font-semibold text-slate-900">Recent messages</h2>
          <p className="mt-2 text-sm text-slate-600">Track the latest messages you've sent to customers.</p>

          <div className="mt-6 space-y-4">
            {sentMessages.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                No messages sent yet. Use the form to send notifications to customers.
              </div>
            ) : (
              sentMessages.map((message) => (
                <div key={message.id} className="rounded-3xl border border-slate-200 p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{message.subject}</p>
                      <p className="text-sm text-slate-500">To {message.recipient} — {message.email}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{message.sentAt}</span>
                  </div>
                  <p className="mt-4 text-sm text-slate-700 whitespace-pre-line">{message.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
