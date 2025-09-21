# To-Do List

This to-do list is based on the audit report and review of the `README.md` file.

## High Priority

- [ ] **Implement Authorization for File Access:** Secure the `filesRouter.getDownloadUrl` procedure by making it a `protectedProcedure` or by implementing a mechanism to verify that the user has permission to access the file.
- [ ] **Complete Placeholder Features:** Implement the `TODO` items in `filesRouter.ts`, including signed URL generation and share link creation.

## Medium Priority

- [ ] **Improve Error Handling:** Use more specific error types and provide more context in error messages. For example, use a `TRPCError` with a `NOT_FOUND` code when a file is not found.
- [ ] **Increase Test Coverage:** Write tests for the tRPC routers, database logic, and other critical parts of the application.
- [ ] **Update `README.md`:**
  - [ ] Remove references to `NEXTAUTH_SECRET` and `NEXTAUTH_URL`.
  - [ ] Add more information about the project's features.
  - [ ] Use a consistent name for the project.
  - [ ] Verify the license.

## Low Priority

- [ ] **Add Input Validation:** Review the codebase for any areas where input validation is missing and add it where necessary.
