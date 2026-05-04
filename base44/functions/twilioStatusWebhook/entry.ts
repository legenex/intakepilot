import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('', { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const formData = await req.formData();

    const messageSid = formData.get('MessageSid') as string;
    const messageStatus = formData.get('MessageStatus') as string;
    const errorCode = formData.get('ErrorCode') as string;

    if (!messageSid) {
      return new Response('', { status: 200 });
    }

    // Find Message by provider_message_id
    const messages = await base44.asServiceRole.entities.Message.filter(
      { provider_message_id: messageSid },
      '-created_date',
      1
    );

    if (messages.length) {
      const msg = messages[0];
      const updateData: Record<string, any> = {
        status: messageStatus,
      };

      if (messageStatus === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }
      if (errorCode) {
        updateData.error_code = errorCode;
        updateData.error_message = `Twilio error: ${errorCode}`;
      }

      await base44.asServiceRole.entities.Message.update(msg.id, updateData);
    }

    // Twilio expects empty response or empty TwiML
    return new Response('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    console.error('Twilio status webhook error:', error);
    return new Response('', { status: 200 });
  }
});