package com.smartcampus.repository;

import com.smartcampus.model.ResourceUsage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceUsageRepository extends MongoRepository<ResourceUsage, String> {
    List<ResourceUsage> findByResourceType(String resourceType);
}
