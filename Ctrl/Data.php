<?php
class Data
{
	public function index() {
		CNavigation::setTitle('Gestion des données');
		CNavigation::setDescription('All your data are belong to us');

		$releves = R::getAll('select name, description, modname from releve r, datamod d where r.user_id = ? and r.mod_id = d.id', array($_SESSION['bd_id'])); 

		DataView::showRelevesList($releves);

		DataView::showAddButton();
	}

	public function choose() {
		CNavigation::setTitle('Nouveau relevé');
		CNavigation::setDescription('Sélectionnez le type de relevé');

		$data = DataMod::getDataTypes();
		DataView::showDataTypeList($data);
	}

	public function add() {

		if (CNavigation::isValidSubmit(array('nom','desc', 'mode'), $_REQUEST))
		{
			if (R::findOne('releve', 'name = ? and user_id = ?', array($_REQUEST['nom'], $_SESSION['bd_id'])))
			{
				new CMessage('Un relevé existe déjà avec le même nom', 'error');
				$_REQUEST['type'] = $_REQUEST['mode'];
			}
			else
			{
				$mode = R::findOne('datamod', 'modname = ?', array($_REQUEST['mode']));

				if (!$mode) {
					$mode = R::dispense('datamod');
					$mode->modname = $_REQUEST['mode'];
					R::store($mode);
				}

				$user = R::load('user', $_SESSION['bd_id']);

				$releve = R::dispense('releve');
				$releve->mod = $mode;
				$releve->user = $user;
				$releve->name = $_REQUEST['nom'];
				$releve->description = $_REQUEST['desc'];

				R::store($releve);

				new CMessage('Relevé correctement ajouté');
				CNavigation::redirectToApp('Data');

				return;
			}

		}
		
		global $ROOT_PATH;
		if (!isset($_REQUEST['type'])) CNavigation::redirectToApp();

		$data_type = DataMod::loadDataType($_REQUEST['type']);
		
		CNavigation::setTitle('Nouveau relevé de type «'.$data_type->nom.'»');

		/*$hdir = htmlspecialchars($data_type->dossier);
		echo <<<END
			<img class="thumbnail" src="$ROOT_PATH/Data/$hdir/thumbnail.png" alt=""/>
END;*/

		DataView::showAddForm(array_merge(array(
						'nom' => '',
						'desc' => '',
						'mode' => $data_type->dossier),$_REQUEST));
	}
}
?>
