package com.taskflow.backend.service;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {

    private final Resend resend;
    private final String fromEmail;

    public EmailService(
            @Value("${resend.api.key}") String apiKey,
            @Value("${resend.from.email}") String fromEmail) {
        this.resend = new Resend(apiKey);
        this.fromEmail = fromEmail;
    }

    public void sendInvitationEmail(String toEmail, String orgName, String inviteLink) {
        String htmlBody = """
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
                    <h2 style="color: #6366F1;">You've been invited to join %s</h2>
                    <p>You've been invited to collaborate on TaskFlow AI.</p>
                    <a href="%s"
                       style="display: inline-block; padding: 12px 24px; background: #6366F1;
                              color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
                        Accept Invitation
                    </a>
                    <p style="color: #888; font-size: 12px; margin-top: 24px;">
                        This invitation expires in 7 days.
                    </p>
                </div>
                """.formatted(orgName, inviteLink);

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from(fromEmail)
                .to(toEmail)
                .subject("You've been invited to join " + orgName + " on TaskFlow AI")
                .html(htmlBody)
                .build();

        try {
            CreateEmailResponse response = resend.emails().send(params);
            log.info("Invitation email sent to {} — Resend ID: {}", toEmail, response.getId());
        } catch (Exception e) {
            log.error("Failed to send invitation email to {}: {}", toEmail, e.getMessage());
            // Don't throw — email failure shouldn't block invitation creation
        }
    }

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        String htmlBody = """
                <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
                    <h2 style="color: #6366F1;">Reset your password</h2>
                    <p>We received a request to reset your TaskFlow AI password.</p>
                    <a href="%s"
                       style="display: inline-block; padding: 12px 24px; background: #6366F1;
                              color: white; text-decoration: none; border-radius: 8px; margin-top: 16px;">
                        Reset Password
                    </a>
                    <p style="color: #888; font-size: 12px; margin-top: 24px;">
                        This link expires in 1 hour. If you didn't request this, you can ignore this email.
                    </p>
                </div>
                """.formatted(resetLink);

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from(fromEmail)
                .to(toEmail)
                .subject("Reset your TaskFlow AI password")
                .html(htmlBody)
                .build();

        try {
            CreateEmailResponse response = resend.emails().send(params);
            log.info("Password reset email sent to {} — Resend ID: {}", toEmail, response.getId());
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", toEmail, e.getMessage());
        }
    }
}