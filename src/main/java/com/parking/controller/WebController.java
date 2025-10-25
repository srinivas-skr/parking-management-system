package com.parking.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Web Controller for serving frontend
 */
@Controller
public class WebController {

    /**
     * Serve the React frontend for all non-API routes
     * This enables client-side routing to work properly
     */
    @GetMapping(value = {"/", "/{path:[^\\.]*}"})
    public String forward() {
        return "forward:/index.html";
    }
}
