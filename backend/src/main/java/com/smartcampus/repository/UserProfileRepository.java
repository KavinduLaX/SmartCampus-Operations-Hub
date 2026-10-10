package com.smartcampus.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.smartcampus.model.UserProfile;

@Repository
public interface UserProfileRepository extends MongoRepository<UserProfile, String> {
    Optional<UserProfile> findByProviderAndProviderId(String provider, String providerId);
    Optional<UserProfile> findByEmail(String email);
}
