FROM nocodb/nocodb:2026.06.0

USER root

RUN mkdir -p /opt/airtablesync/plugin /opt/airtablesync/init

COPY nocodb-plugin/ /opt/airtablesync/plugin/
COPY scripts/init.sh /opt/airtablesync/init/init.sh
RUN chmod +x /opt/airtablesync/init/init.sh

USER 1000

ENTRYPOINT ["/opt/airtablesync/init/init.sh"]
