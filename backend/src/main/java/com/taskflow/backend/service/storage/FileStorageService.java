package com.taskflow.backend.service.storage;

import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

public interface FileStorageService {

    /**
     * Stores the given file under a task-scoped subdirectory and returns
     * the generated stored filename (UUID-based, never the original name).
     */
    String store(MultipartFile file, String taskId, String storedFileName);

    /**
     * Opens an input stream for the given stored file, scoped to the task's
     * subdirectory. Throws if the resolved path escapes the storage root.
     */
    InputStream load(String taskId, String storedFileName);

    /**
     * Deletes the given stored file. Returns true if deletion succeeded,
     * false if the file did not exist or could not be deleted.
     */
    boolean delete(String taskId, String storedFileName);
}
