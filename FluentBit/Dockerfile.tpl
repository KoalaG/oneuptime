FROM cr.fluentbit.io/fluent/fluent-bit

# This container will only run in dev env, so this is ok.
USER root

EXPOSE 24224
EXPOSE 24284
EXPOSE 2020