package com.taskflow.backend.config;

import com.taskflow.backend.repository.UserRepository;
import com.taskflow.backend.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

/**
 * Authenticates the STOMP CONNECT frame using the same JWT validation
 * JwtFilter already uses for regular REST requests. WebSocket
 * connections don't go through the servlet filter chain, so this is a
 * separate entry point that reuses JwtService rather than
 * re-implementing token validation.
 *
 * The resulting Principal is attached to the STOMP session here, which
 * is what makes SimpMessagingTemplate.convertAndSendToUser(...) later
 * able to correctly target a specific authenticated user by their
 * Principal name (their user ID), rather than broadcasting to everyone.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtStompChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                log.warn("STOMP CONNECT rejected: missing Authorization header");
                throw new org.springframework.messaging.MessagingException(
                        "Missing Authorization header on STOMP CONNECT");
            }

            String jwt = authHeader.substring(7);

            if (!jwtService.validateToken(jwt)) {
                log.warn("STOMP CONNECT rejected: invalid or expired token");
                throw new org.springframework.messaging.MessagingException(
                        "Invalid or expired token");
            }

            String userId = jwtService.extractUserId(jwt);
            UserDetails userDetails = userRepository.findById(userId).orElse(null);

            if (userDetails == null) {
                log.warn("STOMP CONNECT rejected: user {} not found", userId);
                throw new org.springframework.messaging.MessagingException(
                        "Account not found");
            }

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());

            // Principal name becomes userId here, since User implements
            // UserDetails and its username/id is what getName() returns
            // via the authentication token below.
            accessor.setUser(authToken);
            log.info("STOMP CONNECT authenticated for user {}", userId);
        }

        return message;
    }
}