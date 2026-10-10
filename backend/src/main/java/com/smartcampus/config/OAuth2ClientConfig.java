package com.smartcampus.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.security.config.oauth2.client.CommonOAuth2Provider;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;

@Configuration
@PropertySource(value = "file:.env", ignoreResourceNotFound = true)
@PropertySource(value = "file:../.env", ignoreResourceNotFound = true)
public class OAuth2ClientConfig {

    @Bean
    @ConditionalOnProperty(name = { "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET" })
    public ClientRegistrationRepository clientRegistrationRepository(Environment env) {
        String clientId = env.getProperty("GOOGLE_CLIENT_ID");
        String clientSecret = env.getProperty("GOOGLE_CLIENT_SECRET");

        ClientRegistration google = CommonOAuth2Provider.GOOGLE.getBuilder("google")
                .clientId(clientId)
                .clientSecret(clientSecret)
                .scope("openid", "profile", "email")
                .build();

        return new InMemoryClientRegistrationRepository(google);
    }
}