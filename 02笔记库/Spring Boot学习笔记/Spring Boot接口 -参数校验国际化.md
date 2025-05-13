## 参考
> https://pdai.tech/md/spring/springboot/springboot-x-interface-param-i18n.html
## 流程
- 客户端发起请求。
- 请求到达 Spring Boot 应用。
- CustomLocaleChangeInterceptor 拦截请求，尝试从请求头中获取语言信息。
- 如果请求头中没有，则尝试从请求参数中获取。
- 根据获取到的语言信息，LocaleResolver 设置当前用户的语言环境。
- 接口接收到参数，进行参数检验。
- 如果参数检验失败，LocalValidatorFactoryBean 会生成错误代码。
- LocalValidatorFactoryBean 将错误代码交给 ResourceBundleMessageSource，根据当前用户的语言环境获取对应的国际化错误消息。
- 最终，接口返回包含符合用户语言习惯的错误提示的响应。