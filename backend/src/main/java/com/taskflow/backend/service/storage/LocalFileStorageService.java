package com.taskflow.backend.service.storage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Slf4j
@Service
public class LocalFileStorageService implements FileStorageService {

    private final Path rootDir;

    public LocalFileStorageService(@Value("${app.file.upload-dir}") String uploadDir) {
        this.rootDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootDir);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not initialize storage directory", e);
        }
    }

    @Override
    public String store(MultipartFile file, String taskId, String storedFileName) {
        Path taskDir = resolveTaskDir(taskId);
        Path target = resolveAndVerify(taskDir, storedFileName);

        try {
            Files.createDirectories(taskDir);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to store file", e);
        }

        return storedFileName;
    }

    @Override
    public InputStream load(String taskId, String storedFileName) {
        Path taskDir = resolveTaskDir(taskId);
        Path target = resolveAndVerify(taskDir, storedFileName);

        if (!Files.exists(target)) {
            throw new UncheckedIOException(new IOException("File not found on disk: " + storedFileName));
        }

        try {
            return Files.newInputStream(target);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to read file", e);
        }
    }

    @Override
    public boolean delete(String taskId, String storedFileName) {
        Path taskDir = resolveTaskDir(taskId);
        Path target = resolveAndVerify(taskDir, storedFileName);

        try {
            return Files.deleteIfExists(target);
        } catch (IOException e) {
            log.error("Failed to delete file {} for task {}: {}", storedFileName, taskId, e.getMessage());
            return false;
        }
    }

    // ─── Helpers ────────────────────────────────────────────────────

    private Path resolveTaskDir(String taskId) {
        // taskId comes from our own DB (UUID format), not user-controlled free text,
        // but we still normalize + verify it never escapes rootDir.
        Path taskDir = rootDir.resolve("tasks").resolve(taskId).normalize();
        if (!taskDir.startsWith(rootDir)) {
            throw new SecurityException("Invalid task storage path");
        }
        return taskDir;
    }

    private Path resolveAndVerify(Path taskDir, String storedFileName) {
        Path resolved = taskDir.resolve(storedFileName).normalize();
        if (!resolved.startsWith(rootDir)) {
            throw new SecurityException("Path traversal attempt detected");
        }
        return resolved;
    }
}