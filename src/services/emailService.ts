import nodemailer from 'nodemailer';
import { env } from '../config/environment';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE, // true for 465, false for other ports
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });
  }

  async sendPasswordResetEmail(email: string, resetToken: string, userName?: string): Promise<void> {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const htmlTemplate = this.getPasswordResetHtmlTemplate(resetUrl, userName);
    
    const mailOptions = {
      from: `"DietaDireta" <${env.SMTP_FROM}>`,
      to: email,
      subject: 'Redefinir sua senha - DietaDireta',
      html: htmlTemplate,
      text: `
        Olá${userName ? ` ${userName}` : ''},
        
        Você solicitou a redefinição de sua senha no DietaDireta.
        
        Clique no link abaixo para criar uma nova senha:
        ${resetUrl}
        
        Este link expira em 1 hora por motivos de segurança.
        
        Se você não solicitou esta redefinição, ignore este email.
        
        Atenciosamente,
        Equipe DietaDireta
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Falha ao enviar email de redefinição de senha');
    }
  }

  private getPasswordResetHtmlTemplate(resetUrl: string, userName?: string): string {
    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redefinir Senha - DietaDireta</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .container {
            background-color: #ffffff;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #16a34a;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .greeting {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
          }
          .content {
            font-size: 16px;
            margin-bottom: 30px;
            line-height: 1.8;
          }
          .cta-button {
            display: inline-block;
            background-color: #16a34a;
            color: #ffffff;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: background-color 0.3s ease;
          }
          .cta-button:hover {
            background-color: #15803d;
          }
          .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            font-size: 14px;
            color: #92400e;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            font-size: 14px;
            color: #6b7280;
            text-align: center;
          }
          .security-note {
            background-color: #f0fdf4;
            border: 1px solid #16a34a;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
            font-size: 14px;
            color: #166534;
          }
          @media (max-width: 600px) {
            body {
              padding: 10px;
            }
            .container {
              padding: 20px;
            }
            .cta-button {
              display: block;
              width: 100%;
              box-sizing: border-box;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🥗 DietaDireta</div>
            <h1 class="title">Redefinir sua senha</h1>
          </div>
          
          <div class="greeting">
            Olá${userName ? ` ${userName}` : ''},
          </div>
          
          <div class="content">
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no DietaDireta.</p>
            
            <p>Para criar uma nova senha, clique no botão abaixo:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="cta-button">Redefinir Minha Senha</a>
            </div>
            
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all; background-color: #f3f4f6; padding: 12px; border-radius: 6px; font-family: monospace; font-size: 14px;">
              ${resetUrl}
            </p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Importante:</strong> Este link expira em 1 hora por motivos de segurança.
          </div>
          
          <div class="security-note">
            <strong>🔒 Dica de Segurança:</strong> Se você não solicitou esta redefinição de senha, ignore este email. Sua conta permanecerá segura.
          </div>
          
          <div class="footer">
            <p>Este email foi enviado automaticamente pelo sistema DietaDireta.</p>
            <p>Para dúvidas ou suporte, entre em contato conosco.</p>
            <br>
            <p style="color: #9ca3af; font-size: 12px;">
              © ${new Date().getFullYear()} DietaDireta. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();