>参考文章：https://pdai.tech/md/spring/springboot/springboot-x-hello-anno.html
## 一个简单的CURD项目用到的注解
好的，根据你提供的代码，这个 Spring Boot CURD 项目中主要用到了以下 Spring Framework 和 Jakarta Persistence API 的注解：

**Spring Framework 注解：**

* **`@SpringBootApplication`**: (通常在 `DemoApplication.java` 中) 这是一个组合注解，包含了 `@Configuration`, `@EnableAutoConfiguration`, 和 `@ComponentScan`。它是 Spring Boot 应用的入口标识。
* **`@RestController`**: (在 `StudentController.java` 中) 这是一个组合注解，包含了 `@Controller` 和 `@ResponseBody`。用于标记一个类为处理 HTTP 请求的控制器，并且其方法返回值将直接作为 HTTP 响应体的内容（通常是 JSON 或 XML）。
* **`@Controller`**: (隐含在 `@RestController` 中) 标记一个类为 Spring MVC 控制器，负责处理用户的请求。
* **`@ResponseBody`**: (隐含在 `@RestController` 中) 标记控制器方法的返回值应该直接绑定到 Web 响应体中。
* **`@Service`**: (在 `StudentServiceImpl.java` 中) 标记一个类为服务组件，包含业务逻辑。Service 层的 Bean 由 Spring 容器管理。
* **`@Repository`**: (在 `StudentRepository.java` 中) 标记一个接口为数据仓库组件，负责数据访问操作。它通常用于将数据访问相关的异常转换为 Spring 的 DataAccessException 体系。虽然 `JpaRepository` 已经具有数据访问语义，但显式使用 `@Repository` 可以更清晰地表达其角色。
* **`@Autowired`**: (在 `StudentController.java` 和 `StudentServiceImpl.java` 中) 用于实现依赖注入。Spring 容器会自动将匹配类型的 Bean 注入到被 `@Autowired` 注解的字段、构造器或方法参数中。
* **`@GetMapping`**: (在 `StudentController.java` 中) 用于将 HTTP GET 请求映射到特定的处理方法上，并指定了请求的 URL 路径 (`/student/{id}`).
* **`@PostMapping`**: (在 `StudentController.java` 中) 用于将 HTTP POST 请求映射到特定的处理方法上，并指定了请求的 URL 路径 (`/student`).
* **`@DeleteMapping`**: (在 `StudentController.java` 中) 用于将 HTTP DELETE 请求映射到特定的处理方法上，并指定了请求的 URL 路径 (`/student/{id}`).
* **`@PutMapping`**: (在 `StudentController.java` 中) 用于将 HTTP PUT 请求映射到特定的处理方法上，并指定了请求的 URL 路径 (`/student/{id}`).
* **`@PathVariable`**: (在 `StudentController.java` 的方法参数中) 用于从 URL 路径中提取变量值，并将其绑定到方法的参数上 (`id`).
* **`@RequestBody`**: (在 `StudentController.java` 的方法参数中) 用于将 HTTP 请求体的内容（通常是 JSON）反序列化为方法的参数对象 (`StudentDTO`).
* **`@RequestParam`**: (在 `StudentController.java` 的方法参数中) 用于将 HTTP 请求参数绑定到方法的参数上 (`name`, `email`). `required = false` 表明这些参数不是必需的。

**Jakarta Persistence API (JPA) 注解：**

* **`@Entity`**: (在 `Student.java` 中) 标记一个 Java 类为 JPA 实体，表示它将映射到数据库中的一个表。
* **`@Table`**: (在 `Student.java` 中) 用于指定实体类映射的数据库表名 (`name="Student"`).
* **`@Id`**: (在 `Student.java` 的 `id` 字段上) 标记实体类的主键字段。
* **`@GeneratedValue`**: (在 `Student.java` 的 `id` 字段上) 配置主键的生成策略 (`strategy = IDENTITY`，表示主键由数据库自动生成，通常用于自增列).
* **`@Column`**: (在 `Student.java` 的字段上) 用于指定实体类字段映射的数据库列名 (`name="id"`, `name="name"`, `name="email"`, `name="age"`).

这些注解在你的 Spring Boot CURD 系统中起着至关重要的作用，它们简化了配置、实现了依赖注入、处理了 Web 请求、定义了数据模型以及实现了数据持久化。