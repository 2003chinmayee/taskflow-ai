package com.taskflow.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    public void sendInvitationEmail(String toEmail,
                                    String orgName,
                                    String inviteLink) {

        String html = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
                    <h2 style="color:#7C3AED">
                        You're invited to join %s
                    </h2>

                    <p>
                        You've been invited to collaborate on
                        <strong>TaskFlow AI</strong>.
                    </p>

                    <p>
                        Click the button below to accept your invitation.
                    </p>

                    <a href="%s"
                       style="
                           display:inline-block;
                           background:#7C3AED;
                           color:white;
                           padding:12px 24px;
                           text-decoration:none;
                           border-radius:8px;
                           margin-top:20px;">
                        Accept Invitation
                    </a>

                    <p style="margin-top:30px;color:#777">
                        This invitation expires in 7 days.
                    </p>
                </div>
                """.formatted(orgName, inviteLink);

        sendHtmlEmail(
                toEmail,
                "You're invited to join " + orgName + " on TaskFlow AI",
                html
        );
    }

    public void sendPasswordResetEmail(String toEmail,
                                       String resetLink) {

        String html = """
                <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto">
                    <h2 style="color:#7C3AED">
                        Reset your password
                    </h2>

                    <p>
                        Click below to reset your password.
                    </p>

                    <a href="%s"
                       style="
                           display:inline-block;
                           background:#7C3AED;
                           color:white;
                           padding:12px 24px;
                           text-decoration:none;
                           border-radius:8px;
                           margin-top:20px;">
                        Reset Password
                    </a>

                    <p style="margin-top:30px;color:#777">
                        This link expires in one hour.
                    </p>
                </div>
                """.formatted(resetLink);

        sendHtmlEmail(
                toEmail,
                "Reset your TaskFlow AI password",
                html
        );
    }

    private void sendHtmlEmail(String to,
                               String subject,
                               String html) {

        try {

            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper =
                    new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);

            mailSender.send(message);

            log.info("Email sent successfully to {}", to);

        } catch (MessagingException | MailException e) {

            log.error("Failed to send email to {}", to, e);
        }
    }
}