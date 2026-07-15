package com.accounting_api.controllers;

import com.accounting_api.models.AccountUser;
import com.accounting_api.models.LoginRequest;
import com.accounting_api.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    // POST - Register
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody AccountUser user) {
        return userService.register(user);
    }

    // POST - Login
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest loginRequest) {
        return userService.login(loginRequest);
    }

    // GET - Profile (only your own — id must match the token)
    @GetMapping("/{id}/profile")
    public Map<String, Object> getProfile(@PathVariable Integer id,
                                          @RequestAttribute("userId") Integer authUserId) {
        checkOwnership(id, authUserId);
        return userService.getProfile(id);
    }

    // PUT - Update Profile (only your own — id must match the token)
    @PutMapping("/{id}/profile")
    public Map<String, Object> updateProfile(@PathVariable Integer id,
                                             @RequestBody AccountUser updatedUser,
                                             @RequestAttribute("userId") Integer authUserId) {
        checkOwnership(id, authUserId);
        return userService.updateProfile(id, updatedUser);
    }

    private void checkOwnership(Integer id, Integer authUserId) {
        if (!id.equals(authUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only access your own profile");
        }
    }
}