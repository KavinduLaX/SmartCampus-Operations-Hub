package com.smartcampus.security;

import java.util.Collection;
import java.util.Set;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import com.smartcampus.model.UserProfile;
import com.smartcampus.service.UserProfileService;

@Service
public class CustomOidcUserService extends OidcUserService {

    private final UserProfileService userProfileService;

    public CustomOidcUserService(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) {
        OidcUser user = super.loadUser(userRequest);
        String provider = userRequest.getClientRegistration().getRegistrationId();

        UserProfile profile = userProfileService.upsertFromOAuth(provider, user.getClaims());

        String role = profile != null && profile.getRole() != null ? profile.getRole() : "USER";
        Collection<GrantedAuthority> authorities = Set.of(new SimpleGrantedAuthority("ROLE_" + role));

        // Return a DefaultOidcUser with authorities
        return new DefaultOidcUser(authorities, user.getIdToken(), user.getUserInfo());
    }
}
