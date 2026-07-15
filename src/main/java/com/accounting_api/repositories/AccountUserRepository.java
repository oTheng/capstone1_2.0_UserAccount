package com.accounting_api.repositories;

import com.accounting_api.models.AccountUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountUserRepository extends JpaRepository<AccountUser, Integer> {

    Optional<AccountUser> findByEmail(String email);

    boolean existsByEmail(String email);
}