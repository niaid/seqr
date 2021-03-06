from bs4 import BeautifulSoup

from seqr.models import Individual
from seqr.model_utils import find_matching_xbrowse_model


def convert_html_to_plain_text(html_string, remove_line_breaks=False):
    """Returns string after removing all HTML markup.

    Args:
        html_string (str): string with HTML markup
        remove_line_breaks (bool): whether to also remove line breaks and extra white space from string
    """
    if not html_string:
        return ''

    text = BeautifulSoup(html_string, "html.parser").get_text()

    # remove empty lines as well leading and trailing space on non-empty lines
    if remove_line_breaks:
        text = ' '.join(line.strip() for line in text.splitlines() if line.strip())

    return text


def can_edit_family_id(family):
    _can_edit_entity_id(family.project, 'family_id', family.family_id)


def can_edit_individual_id(individual):
    _can_edit_entity_id(individual.family.project, 'individual_id', individual.individual_id)


def _can_edit_entity_id(project, entity_id_key, entity_id):
    base_project = find_matching_xbrowse_model(project)
    if base_project.vcffile_set.count() and not base_project.has_elasticsearch_index():
        raise ValueError('Editing {} is disabled for projects which still use the mongo datastore'.format(entity_id_key))
    if project.is_mme_enabled:
        filter_key = 'family__family_id' if entity_id_key == 'family_id' else 'individual_id'
        individual_filter = {'family__project': project, filter_key: entity_id}
        if any(indiv for indiv in Individual.objects.filter(**individual_filter) if indiv.mme_submitted_date and not indiv.mme_deleted_date):
            raise ValueError('Editing {} is disabled for {} because it has matchmaker submissions'.format(
                entity_id_key, entity_id))
