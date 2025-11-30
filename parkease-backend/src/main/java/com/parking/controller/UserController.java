package com.parking.controller;

import com.parking.dto.request.PasswordUpdateRequest;
import com.parking.dto.request.ProfileUpdateRequest;
import com.parking.dto.response.ApiResponse;
import com.parking.dto.response.UserResponse;
import com.parking.security.UserPrincipal;
import com.parking.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Users", description = "User profile management APIs")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get Current User", description = "Get current authenticated user profile")
    public ResponseEntity<UserResponse> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(userService.getUserById(currentUser.getId()));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update Profile", description = "Update user profile information")
    public ResponseEntity<UserResponse> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        UserResponse updatedUser = userService.updateProfile(currentUser.getId(), request);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/password")
    @Operation(summary = "Update Password", description = "Update user password")
    public ResponseEntity<ApiResponse> updatePassword(
            @Valid @RequestBody PasswordUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        userService.updatePassword(currentUser.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Password updated successfully"));
    }
}
