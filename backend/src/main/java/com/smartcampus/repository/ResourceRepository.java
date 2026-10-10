package com.smartcampus.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.smartcampus.model.Resource;
import com.smartcampus.model.ResourceType;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {
    List<Resource> findByType(ResourceType type);
    List<Resource> findByLocation(String location);
    List<Resource> findByCapacityGreaterThanEqual(int capacity);
}
