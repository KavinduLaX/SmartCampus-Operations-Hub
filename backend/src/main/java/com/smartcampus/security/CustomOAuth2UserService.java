package com.smartcampus.security;

import java.util.Collection;
import java.util.Map;
import java.util.Set;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.smartcampus.model.UserProfile;
import com.smartcampus.service.UserProfileService;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserProfileService userProfileService;

    public CustomOAuth2UserService(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) {
        OAuth2User user = super.loadUser(userRequest);
        String provider = userRequest.getClientRegistration().getRegistrationId();

        // Upsert and get saved profile
        UserProfile profile = userProfileService.upsertFromOAuth(provider, user.getAttributes());

        // Build authorities from stored role
        String role = profile != null && profile.getRole() != null ? profile.getRole() : "USER";
        Collection<GrantedAuthority> authorities = Set.of(new SimpleGrantedAuthority("ROLE_" + role));

        String nameAttrKey = userRequest.getClientRegistration().getProviderDetails()
                .getUserInfoEndpoint().getUserNameAttributeName();

        Map<String, Object> attributes = user.getAttributes();

        return new DefaultOAuth2User(authorities, attributes, nameAttrKey != null ? nameAttrKey : "sub");
    }
}
